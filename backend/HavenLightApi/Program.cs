using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using DotNetEnv;
using Npgsql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

// --- ASP.NET Identity ---
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
    {
        // Strengthened password policy (per IS 414 requirement)
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 12;
        options.Password.RequiredUniqueChars = 3;
    })
    .AddEntityFrameworkStores<HavenLightContext>()
    .AddDefaultTokenProviders();

// --- JWT Authentication ---
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("DonorOrAdmin", policy => policy.RequireRole("Admin", "Donor"));
});

// --- CORS ---
// Local dev: localhost. Production: set Cors__AllowedOrigins in Azure (comma-separated), e.g.
//   https://your-app.vercel.app,https://your-app-git-main-team.vercel.app
var corsRaw = builder.Configuration["Cors:AllowedOrigins"];
string[] corsOrigins = string.IsNullOrWhiteSpace(corsRaw)
    ? ["http://localhost:3000", "http://localhost:5173"]
    : corsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(o => o.Trim().TrimEnd('/'))
        .Where(o => !string.IsNullOrWhiteSpace(o))
        .ToArray();

static bool IsOriginAllowed(string origin, string[] allowed)
{
    if (string.IsNullOrWhiteSpace(origin)) return false;
    origin = origin.Trim().TrimEnd('/');

    foreach (var entry in allowed)
    {
        if (string.IsNullOrWhiteSpace(entry)) continue;

        var e = entry.Trim().TrimEnd('/');

        // Exact match (preferred)
        if (string.Equals(origin, e, StringComparison.OrdinalIgnoreCase)) return true;

        // Allow specifying a base without the Vercel suffix (e.g. "https://intex-3-13")
        // so it still matches "https://intex-3-13.vercel.app".
        if (!e.Contains(".vercel.app", StringComparison.OrdinalIgnoreCase)
            && origin.StartsWith(e, StringComparison.OrdinalIgnoreCase)
            && origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
            return true;

        // Allow a safe prefix match when an entry ends with '*' (e.g. "https://foo-*-team.vercel.app*")
        if (e.EndsWith('*'))
        {
            var prefix = e.TrimEnd('*').Trim();
            if (prefix.Length > 0 && origin.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return true;
        }
    }

    return false;
}
// No AllowCredentials: frontend uses Bearer tokens in headers only (no cookie auth). That avoids
// stricter CORS + preflight behavior that can stall or fail cross-origin (e.g. Vercel → Azure).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => IsOriginAllowed(origin, corsOrigins))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddOpenApi();

var app = builder.Build();

// --- Seed database on startup ---
using (var scope = app.Services.CreateScope())
{
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

    // Seed default roles and admin user
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();

    string[] roles = ["Admin", "Donor"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    const string adminEmail = "admin@havenlight.ph";
    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var admin = new IdentityUser { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true };
        var result = await userManager.CreateAsync(admin, "Admin@Haven2026!");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }
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

app.Run();
