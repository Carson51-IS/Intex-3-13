using HavenLightApi.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace HavenLightApi.Auth;

public sealed class AuthIdentityGenerator
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AdminSeedOptions _options;

    public AuthIdentityGenerator(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IOptions<AdminSeedOptions> options)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _options = options.Value;
    }

    public async Task SeedAsync()
    {
        string[] roles = [AuthRoles.Admin, AuthRoles.Customer, AuthRoles.Donor];
        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));
        }

        if (string.IsNullOrWhiteSpace(_options.Email) || string.IsNullOrWhiteSpace(_options.Password))
            return;

        var admin = await _userManager.FindByEmailAsync(_options.Email);
        if (admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = _options.Email,
                Email = _options.Email,
                EmailConfirmed = true,
            };

            var createResult = await _userManager.CreateAsync(admin, _options.Password);
            if (!createResult.Succeeded)
                return;
        }

        if (!await _userManager.IsInRoleAsync(admin, AuthRoles.Admin))
            await _userManager.AddToRoleAsync(admin, AuthRoles.Admin);
    }
}

public sealed class AdminSeedOptions
{
    public string Email { get; set; } = "admin@rootkit.local";
    public string Password { get; set; } = "Admin@Rootkit123!";
}
