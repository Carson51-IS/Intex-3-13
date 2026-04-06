using System.Text;
using DotNetEnv;
using Npgsql;
using HavenLightApi.Auth;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using HavenLightApi;
using HavenLightApi.Data;

// Npgsql 10.x requires DateTime.Kind == Utc for timestamptz columns; CSV seed data has Kind=Unspecified.
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Repo-root .env — must load before config. Clobber so .env wins over stale machine/user env (e.g. old localhost).
if (PathResolver.FindEnvFile() is { } envFile)
    Env.Load(envFile, new LoadOptions(setEnvVars: true, clobberExistingVars: true));

var builder = WebApplication.CreateBuilder(args);

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
        options.UseNpgsql(conn);
        return;
    }
    var nb = new NpgsqlConnectionStringBuilder(conn);
    if (nb.Port == 6543)
        nb.MaxAutoPrepare = 0;
    options.UseNpgsql(nb.ConnectionString);
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// Separate identity context (auth data isolated from domain data).
builder.Services.AddDbContext<AuthIdentityDbContext>(options =>
{
    var identityConn = builder.Configuration.GetConnectionString("IdentityConnection")
        ?? builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(identityConn);
});

// --- ASP.NET Identity ---
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AuthIdentityDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    // IS 413 lab-standard hardening configuration.
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 12;
    options.Password.RequiredUniqueChars = 3;
    options.User.RequireUniqueEmail = true;
});

builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? string.Empty;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? string.Empty;
        options.SignInScheme = IdentityConstants.ExternalScheme;
    });

// Identity configures cookie authentication for sign-in.
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.ManageCatalog, policy => policy.RequireRole(AuthRoles.Admin));
    options.AddPolicy(AuthPolicies.DonorOrAdmin, policy => policy.RequireRole(AuthRoles.Admin, AuthRoles.Customer, AuthRoles.Donor));
});
builder.Services.Configure<AdminSeedOptions>(builder.Configuration.GetSection("AdminSeed"));
builder.Services.AddScoped<AuthIdentityGenerator>();

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

// --- Seed database on startup ---
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HavenLightContext>();
    var identityContext = scope.ServiceProvider.GetRequiredService<AuthIdentityDbContext>();
    await identityContext.Database.MigrateAsync();
    await context.Database.MigrateAsync();

    var csvFolder = PathResolver.FindLighthouseCsvFolder()
        ?? Path.Combine(app.Environment.ContentRootPath, "..", "..", "lighthouse_csv_v7");
    await SeedData.InitializeAsync(context, csvFolder);

    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("HavenLightApi");
    if (!await context.Safehouses.AnyAsync())
        logger.LogWarning(
            "No rows in safehouses after seed. CSV folder used: {CsvPath}. See SEEDING.md — set ConnectionStrings__DefaultConnection and ensure lighthouse_csv_v7 exists.",
            csvFolder);

    var identityGenerator = scope.ServiceProvider.GetRequiredService<AuthIdentityGenerator>();
    await identityGenerator.SeedAsync();
}

// --- Middleware Pipeline ---
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

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
app.MapGroup("/api/identity").MapIdentityApi<ApplicationUser>();

app.Run();
