using DotNetEnv;
using Npgsql;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using HavenLightApi;
using HavenLightApi.Data;
using HavenLightApi.Infrastructure;
using Microsoft.AspNetCore.Authentication.Google;
using System.Threading;

// Npgsql 10.x requires DateTime.Kind == Utc for timestamptz columns; CSV seed data has Kind=Unspecified.
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Local dev only: single instance guard (Windows). Never run on Azure — multiple workers must not exit.
var onAzureAppService = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME"));
Mutex? localDevSingleInstanceLock = null;
if (!onAzureAppService)
{
    localDevSingleInstanceLock = new Mutex(
        initiallyOwned: true,
        name: @"Global\HavenLightApi_Local_5055",
        createdNew: out var isPrimaryInstance);
    if (!isPrimaryInstance)
    {
        Console.WriteLine("[HavenLightApi] Another local instance is already running on port 5055. Reuse that process or stop it before starting a new one.");
        return;
    }
}

// Repo-root .env — local/dev only. On Azure App Service use Portal Application Settings.
// Skip DotNetEnv on Azure so a accidentally deployed .env cannot override or mask Portal secrets.
if (!onAzureAppService && PathResolver.FindEnvFile() is { } envFile)
    Env.Load(envFile, new LoadOptions(setEnvVars: true, clobberExistingVars: true));

var builder = WebApplication.CreateBuilder(args);
var (googleClientID, googleClientSecret) = GoogleConfigurationReader.Resolve(builder.Configuration);
if (onAzureAppService)
{
    Console.WriteLine(
        $"[HavenLightApi] Google OAuth (lengths only): clientId={googleClientID?.Length ?? 0}, clientSecret={googleClientSecret?.Length ?? 0}");
}


builder.Services.AddDbContext<AuthIdentityDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("AuthIdentityConnection"));
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// SPA on a different origin (e.g. Vercel) needs SameSite=None so fetch(..., credentials:'include') sends auth cookies to the API.
var corsConfigured = !string.IsNullOrWhiteSpace(builder.Configuration["Cors:AllowedOrigins"]);
var crossSiteSessionCookies = corsConfigured || onAzureAppService;
var sessionSameSite = crossSiteSessionCookies ? SameSiteMode.None : SameSiteMode.Lax;

builder.Services.ConfigureApplicationCookie(options => 
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = sessionSameSite;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
});

builder.Services.Configure<CookieAuthenticationOptions>(IdentityConstants.ExternalScheme, options =>
{
    options.Cookie.SameSite = sessionSameSite;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});



// Log which DB host we’re using (helps debug wrong connection string / DNS issues)
var cs = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(cs))
{
    try
    {
        var nb = new NpgsqlConnectionStringBuilder(cs);
        Console.WriteLine($"[HavenLightApi] Database host: {nb.Host}; Port: {nb.Port}; Database: {nb.Database}");
    }
    catch
    {
        Console.WriteLine("[HavenLightApi] Could not parse ConnectionStrings:DefaultConnection.");
    }
}
else
    Console.WriteLine("[HavenLightApi] WARNING: ConnectionStrings:DefaultConnection is missing.");

// --- Database ---
builder.Services.AddDbContext<HavenLightContext>(options =>
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrEmpty(conn))
    {
        throw new InvalidOperationException(
            "ConnectionStrings:DefaultConnection is not set. Configure it in appsettings, .env, or environment variables (see SEEDING.md).");
    }

    // Local/dev safety: avoid hard crash when placeholder Postgres values are still in appsettings.
    var hasPlaceholderPostgres =
        conn.Contains("YOUR_PROJECT_REF", StringComparison.OrdinalIgnoreCase) ||
        conn.Contains("YOUR_DATABASE_PASSWORD", StringComparison.OrdinalIgnoreCase) ||
        conn.Contains("YOUR_SUPABASE_HOST", StringComparison.OrdinalIgnoreCase) ||
        conn.Contains("YOUR_SUPABASE_PASSWORD", StringComparison.OrdinalIgnoreCase);
    if (hasPlaceholderPostgres)
    {
        Console.WriteLine("[HavenLightApi] Placeholder DefaultConnection detected; falling back to local SQLite (HavenLight.local.sqlite).");
        options.UseSqlite("Data Source=HavenLight.local.sqlite");
        options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        return;
    }

    var nb = new NpgsqlConnectionStringBuilder(conn);
    if (nb.Port == 6543)
        nb.MaxAutoPrepare = 0;
    options.UseNpgsql(nb.ConnectionString);
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AuthIdentityDbContext>();

// On every authenticated request, replace cookie/token role claims with current DB roles so
// [Authorize(Roles = "Admin")] always reflects the latest role assignments.
builder.Services.AddScoped<IClaimsTransformation, RoleClaimsTransformation>();

// Enforce password policy after Identity registers its defaults.
builder.Services.PostConfigure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 14;
    options.Password.RequiredUniqueChars = 1;
});

if (!string.IsNullOrEmpty(googleClientID) && !string.IsNullOrEmpty(googleClientSecret))
{
    // Do not use AddAuthentication(GoogleDefaults.AuthenticationScheme) — that makes Google the default scheme
    // and breaks Identity Bearer JWT for /api/auth/login + /api/auth/me.
    builder.Services.AddAuthentication()
        .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
        {
            options.ClientId = googleClientID;
            options.ClientSecret = googleClientSecret;
            options.SignInScheme = IdentityConstants.ExternalScheme;
            options.CallbackPath = new PathString("/signin-google");
        });
}

// Every [Authorize] must accept BOTH cookie (Google / external) and Bearer (email/password) auth.
// Instead of a policy scheme (which has subtle forwarding issues with AddIdentityApiEndpoints),
// we tell each authorization policy to try both schemes explicitly.
string[] authSchemes = [IdentityConstants.ApplicationScheme, IdentityConstants.BearerScheme];

builder.Services.AddAuthorization(options =>
{
    // Default policy: any [Authorize] without a named policy tries both schemes.
    options.DefaultPolicy = new AuthorizationPolicyBuilder(authSchemes)
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy(AuthPolicies.ManageCatalog, policy =>
    {
        policy.AddAuthenticationSchemes(authSchemes);
        policy.RequireRole(AuthRoles.Admin);
    });
    options.AddPolicy("AdminOnly", policy =>
    {
        policy.AddAuthenticationSchemes(authSchemes);
        policy.RequireRole("Admin");
    });
    options.AddPolicy("DonorOrAdmin", policy =>
    {
        policy.AddAuthenticationSchemes(authSchemes);
        policy.RequireRole("Admin", "Donor");
    });
});

// --- CORS ---
// Local dev: localhost. Production: set Cors__AllowedOrigins in Azure (comma-separated), e.g.
//   https://your-app.vercel.app,https://your-app-git-main-team.vercel.app
var corsRaw = builder.Configuration["Cors:AllowedOrigins"];
string[] corsOrigins = string.IsNullOrWhiteSpace(corsRaw)
    ? ["http://localhost:3000", "http://localhost:5173"]
    : corsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
// Frontend uses cookie-based auth flows (Identity + external providers), so credentials must be allowed.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddOpenApi();

var app = builder.Build();

// --- Migrations + CSV seed + identity seed (order matters: SQLite must exist before UserManager runs) ---
using (var scope = app.Services.CreateScope())
{
    var authIdentity = scope.ServiceProvider.GetRequiredService<AuthIdentityDbContext>();
    await authIdentity.Database.MigrateAsync();
    await EnsureAuthProfileColumnsAsync(authIdentity);

    var context = scope.ServiceProvider.GetRequiredService<HavenLightContext>();
    await context.Database.MigrateAsync();
    await EnsureSupportersColumnsAsync(context);
    await EnsureCaseConferencesTableAsync(context);
    await EnsureGalleryImagesTableAsync(context);
    await EnsureDefaultGalleryImagesAsync(context, app.Environment);

    var csvFolder = PathResolver.FindLighthouseCsvFolder()
        ?? Path.Combine(app.Environment.ContentRootPath, "..", "..", "lighthouse_csv_v7");
    await SeedData.InitializeAsync(context, csvFolder);

    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("HavenLightApi");
    if (!await context.Safehouses.AnyAsync())
        logger.LogWarning(
            "No rows in safehouses after seed. CSV folder used: {CsvPath}. See SEEDING.md — set ConnectionStrings__DefaultConnection and ensure lighthouse_csv_v7 exists.",
            csvFolder);

    await AuthIdentityGenerator.GenerateDefaultIdentityAsync(scope.ServiceProvider, app.Configuration);
}

// --- Middleware Pipeline ---
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseSecurityHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseRouting();

// CORS must run early (after routing, before auth) so OPTIONS preflight gets correct headers.
app.UseCors("AllowFrontend");

// Content-Security-Policy header (IS 414 requirement)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none';"
    );
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGroup("/api/auth").MapIdentityApi<ApplicationUser>();

app.Run();

static async Task EnsureAuthProfileColumnsAsync(AuthIdentityDbContext authIdentity)
{
    if (!await HasAspNetUsersColumnAsync(authIdentity, "DisplayName"))
        await authIdentity.Database.ExecuteSqlRawAsync("ALTER TABLE AspNetUsers ADD COLUMN DisplayName TEXT NULL;");
    if (!await HasAspNetUsersColumnAsync(authIdentity, "CurrencyPreference"))
        await authIdentity.Database.ExecuteSqlRawAsync("ALTER TABLE AspNetUsers ADD COLUMN CurrencyPreference TEXT NOT NULL DEFAULT 'PHP';");
    if (!await HasAspNetUsersColumnAsync(authIdentity, "ProfileImageUrl"))
        await authIdentity.Database.ExecuteSqlRawAsync("ALTER TABLE AspNetUsers ADD COLUMN ProfileImageUrl TEXT NULL;");
}

static async Task<bool> HasAspNetUsersColumnAsync(AuthIdentityDbContext authIdentity, string columnName)
{
    await using var connection = authIdentity.Database.GetDbConnection();
    if (connection.State != System.Data.ConnectionState.Open)
        await connection.OpenAsync();

    await using var command = connection.CreateCommand();
    command.CommandText = "PRAGMA table_info('AspNetUsers');";
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        var name = reader.GetString(1);
        if (string.Equals(name, columnName, StringComparison.OrdinalIgnoreCase))
            return true;
    }

    return false;
}

static async Task EnsureCaseConferencesTableAsync(HavenLightContext context)
{
    var provider = context.Database.ProviderName ?? string.Empty;
    if (provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
    {
        await context.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS case_conferences (
                conference_id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                resident_id integer NOT NULL REFERENCES residents(resident_id) ON DELETE CASCADE,
                conference_date date NOT NULL,
                conference_type text NOT NULL,
                status text NOT NULL,
                facilitator text NOT NULL,
                agenda text NOT NULL,
                summary_notes text NULL,
                follow_up_actions text NULL,
                next_conference_date date NULL,
                created_at timestamp with time zone NOT NULL DEFAULT NOW()
            );
            """);
    }
    else if (provider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        await context.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS case_conferences (
                conference_id INTEGER PRIMARY KEY,
                resident_id INTEGER NOT NULL,
                conference_date TEXT NOT NULL,
                conference_type TEXT NOT NULL,
                status TEXT NOT NULL,
                facilitator TEXT NOT NULL,
                agenda TEXT NOT NULL,
                summary_notes TEXT NULL,
                follow_up_actions TEXT NULL,
                next_conference_date TEXT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY(resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
            );
            """);
    }
}

static async Task EnsureGalleryImagesTableAsync(HavenLightContext context)
{
    var provider = context.Database.ProviderName ?? string.Empty;
    if (provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
    {
        await context.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS gallery_images (
                gallery_image_id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                image_url text NOT NULL,
                caption text NULL,
                created_at timestamp with time zone NOT NULL DEFAULT NOW()
            );
            """);
    }
    else if (provider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        await context.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS gallery_images (
                gallery_image_id INTEGER PRIMARY KEY,
                image_url TEXT NOT NULL,
                caption TEXT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            """);
    }
}

static async Task EnsureDefaultGalleryImagesAsync(HavenLightContext context, IWebHostEnvironment environment)
{
    if (await context.GalleryImages.AnyAsync()) return;

    var root = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    var galleryDir = Path.Combine(root, "gallery-images");
    if (!Directory.Exists(galleryDir)) return;

    var defaults = new[]
    {
        ("Beach_Unity.png", "Unity by the shore"),
        ("Girl_on_Beach.png", "Confidence and hope"),
        ("Unity_Circle.png", "Hands together"),
        ("Learnin_and_Talking.png", "Learning and sharing"),
        ("Medical.png", "Health and care"),
    };

    var nextId = (await context.GalleryImages.MaxAsync(x => (int?)x.GalleryImageId) ?? 0) + 1;
    foreach (var (file, caption) in defaults)
    {
        var full = Path.Combine(galleryDir, file);
        if (!File.Exists(full)) continue;
        context.GalleryImages.Add(new HavenLightApi.Models.GalleryImage
        {
            GalleryImageId = nextId++,
            ImageUrl = $"/gallery-images/{file}",
            Caption = caption,
            CreatedAt = DateTime.UtcNow,
        });
    }

    if (context.ChangeTracker.HasChanges())
        await context.SaveChangesAsync();
}

static async Task EnsureSupportersColumnsAsync(HavenLightContext context)
{
    var provider = context.Database.ProviderName ?? string.Empty;
    if (provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
    {
        await context.Database.ExecuteSqlRawAsync("""
            ALTER TABLE supporters
            ADD COLUMN IF NOT EXISTS lapsing_campaign_sent_at timestamp with time zone NULL;
            """);
        return;
    }

    if (provider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        await using var connection = context.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        var hasColumn = false;
        await using (var command = connection.CreateCommand())
        {
            command.CommandText = "PRAGMA table_info('supporters');";
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var name = reader.GetString(1);
                if (string.Equals(name, "lapsing_campaign_sent_at", StringComparison.OrdinalIgnoreCase))
                {
                    hasColumn = true;
                    break;
                }
            }
        }

        if (!hasColumn)
            await context.Database.ExecuteSqlRawAsync("ALTER TABLE supporters ADD COLUMN lapsing_campaign_sent_at TEXT NULL;");
    }
}
