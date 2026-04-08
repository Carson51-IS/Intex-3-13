using DotNetEnv;
using Npgsql;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
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

    var nb = new NpgsqlConnectionStringBuilder(conn);
    if (nb.Port == 6543)
        nb.MaxAutoPrepare = 0;
    options.UseNpgsql(nb.ConnectionString);
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AuthIdentityDbContext>();

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

// Prefer Bearer when Authorization header is present; otherwise use the application cookie (Google / cookie sessions).
const string policyAuthScheme = "HavenLight.AuthPolicy";
builder.Services.AddAuthentication()
    .AddPolicyScheme(policyAuthScheme, policyAuthScheme, options =>
    {
        options.ForwardDefaultSelector = context =>
        {
            var auth = context.Request.Headers.Authorization.ToString();
            if (!string.IsNullOrEmpty(auth) &&
                auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return IdentityConstants.BearerScheme;
            return IdentityConstants.ApplicationScheme;
        };
    });

builder.Services.PostConfigure<AuthenticationOptions>(options =>
{
    options.DefaultAuthenticateScheme = policyAuthScheme;
});

// AddIdentityApiEndpoints already registers Identity.Bearer (and cookies). Do not call AddBearerToken again — it throws "Scheme already exists: Identity.Bearer".
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.ManageCatalog, policy => policy.RequireRole(AuthRoles.Admin));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("DonorOrAdmin", policy => policy.RequireRole("Admin", "Donor"));
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
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
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
