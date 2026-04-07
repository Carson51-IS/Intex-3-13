using DotNetEnv;
using Npgsql;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using HavenLightApi;
using HavenLightApi.Data;
using HavenLightApi.Infrastructure;
using Microsoft.AspNetCore.Authentication.Google;

// Npgsql 10.x requires DateTime.Kind == Utc for timestamptz columns; CSV seed data has Kind=Unspecified.
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Repo-root .env — must load before config. Clobber so .env wins over stale machine/user env (e.g. old localhost).
if (PathResolver.FindEnvFile() is { } envFile)
    Env.Load(envFile, new LoadOptions(setEnvVars: true, clobberExistingVars: true));

var builder = WebApplication.CreateBuilder(args);
var googleClientID = builder.Configuration["Authentication:Google:ClientID"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];


builder.Services.AddDbContext<AuthIdentityDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("AuthIdentityConnection")));

builder.Services.ConfigureApplicationCookie(options => 
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
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
    builder.Services.AddAuthentication(GoogleDefaults.AuthenticationScheme)
        .AddGoogle(options =>
        {
            options.ClientId = googleClientID;
            options.ClientSecret = googleClientSecret;
            options.SignInScheme = IdentityConstants.ExternalScheme;
            options.CallbackPath = new PathString("/signin-google");
        });
}


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
// No AllowCredentials: frontend uses Bearer tokens in headers only (no cookie auth). That avoids
// stricter CORS + preflight behavior that can stall or fail cross-origin (e.g. Vercel → Azure).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// --- Migrations + CSV seed + identity seed (order matters: SQLite must exist before UserManager runs) ---
using (var scope = app.Services.CreateScope())
{
    var authIdentity = scope.ServiceProvider.GetRequiredService<AuthIdentityDbContext>();
    await authIdentity.Database.MigrateAsync();

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
app.UseHttpsRedirection();

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
