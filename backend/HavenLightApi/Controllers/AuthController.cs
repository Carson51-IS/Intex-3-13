using System.Security.Claims;
using HavenLightApi.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using HavenLightApi.Data;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, [FromQuery] bool rememberMe = false)
    {
        var signInResult = await _signInManager.PasswordSignInAsync(
            dto.Email,
            dto.Password,
            isPersistent: rememberMe,
            lockoutOnFailure: true);

        if (signInResult.RequiresTwoFactor)
        {
            if (!string.IsNullOrWhiteSpace(dto.TwoFactorCode))
            {
                var normalized = dto.TwoFactorCode.Replace(" ", string.Empty).Replace("-", string.Empty);
                var twoFactorResult = await _signInManager.TwoFactorAuthenticatorSignInAsync(
                    normalized,
                    rememberMe,
                    rememberClient: false);

                if (!twoFactorResult.Succeeded)
                    return Unauthorized(new { message = "Invalid authenticator code." });
            }
            else if (!string.IsNullOrWhiteSpace(dto.TwoFactorRecoveryCode))
            {
                var normalized = dto.TwoFactorRecoveryCode.Replace(" ", string.Empty);
                var twoFactorResult = await _signInManager.TwoFactorRecoveryCodeSignInAsync(normalized);

                if (!twoFactorResult.Succeeded)
                    return Unauthorized(new { message = "Invalid recovery code." });
            }
            else
            {
                return Ok(new { requiresTwoFactor = true });
            }
        }
        else if (!signInResult.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized(new { message = "Invalid credentials" });

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new { requiresTwoFactor = false, email = user.Email, roles });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email };
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        // For security, public registration is limited to non-admin customer role.
        var requestedRole = string.IsNullOrWhiteSpace(dto.Role) ? AuthRoles.Customer : dto.Role.Trim();
        if (!string.Equals(requestedRole, AuthRoles.Customer, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = $"Only {AuthRoles.Customer} role can be assigned during registration." });

        await _userManager.AddToRoleAsync(user, AuthRoles.Customer);

        return Ok(new { message = "Registration successful." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok("Logged out successfully");
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Ok(new { email = (string?)null, roles = Array.Empty<string>() });

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Ok(new { email = (string?)null, roles = Array.Empty<string>() });

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new { email = user.Email, roles });
    }

    [HttpGet("session")]
    public Task<IActionResult> Session()
    {
        return Me();
    }

    [HttpGet("2fa")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetTwoFactorStatus()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var sharedKey = await _userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(sharedKey))
        {
            await _userManager.ResetAuthenticatorKeyAsync(user);
            sharedKey = await _userManager.GetAuthenticatorKeyAsync(user);
        }

        var recoveryCodesLeft = await _userManager.CountRecoveryCodesAsync(user);
        var isMachineRemembered = await _signInManager.IsTwoFactorClientRememberedAsync(user);

        return Ok(new
        {
            sharedKey,
            recoveryCodesLeft,
            recoveryCodes = Array.Empty<string>(),
            isTwoFactorEnabled = user.TwoFactorEnabled,
            isMachineRemembered
        });
    }

    [HttpPost("2fa/enable")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> EnableTwoFactor([FromBody] EnableTwoFactorDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest(new { message = "Verification code is required." });

        var verificationCode = dto.Code.Replace(" ", string.Empty).Replace("-", string.Empty);
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            verificationCode);

        if (!isValid)
            return BadRequest(new { message = "Invalid authenticator verification code." });

        await _userManager.SetTwoFactorEnabledAsync(user, true);
        var recoveryCodesEnumerable = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);
        var recoveryCodes = (recoveryCodesEnumerable ?? Array.Empty<string>()).ToArray();

        return Ok(new
        {
            recoveryCodes,
            recoveryCodesLeft = recoveryCodes.Length
        });
    }

    [HttpPost("2fa/disable")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> DisableTwoFactor()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        await _userManager.SetTwoFactorEnabledAsync(user, false);
        return Ok(new { message = "Two-factor authentication disabled." });
    }

    [HttpPost("2fa/recovery-codes")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ResetRecoveryCodes()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var recoveryCodesEnumerable = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);
        var recoveryCodes = (recoveryCodesEnumerable ?? Array.Empty<string>()).ToArray();
        return Ok(new
        {
            recoveryCodes,
            recoveryCodesLeft = recoveryCodes.Length
        });
    }

    [HttpGet("external/providers")]
    public async Task<IActionResult> ExternalProviders()
    {
        var providers = await _signInManager.GetExternalAuthenticationSchemesAsync();
        var enabledProviders = providers
            .Where(p => !string.IsNullOrWhiteSpace(p.Name))
            .Select(p => new
            {
                name = p.Name!,
                displayName = p.DisplayName ?? p.Name!
            })
            .ToList();

        return Ok(enabledProviders);
    }

    [HttpGet("external/login/{provider}")]
    public IActionResult ExternalLogin([FromRoute] string provider, [FromQuery] string? returnUrl = "/")
    {
        if (!string.Equals(provider, GoogleDefaults.AuthenticationScheme, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = $"Unsupported provider: {provider}" });

        var callbackUrl = Url.Action(
            nameof(ExternalLoginCallback),
            "Auth",
            new { returnUrl = NormalizeReturnUrl(returnUrl) },
            Request.Scheme);

        if (string.IsNullOrWhiteSpace(callbackUrl))
            return BadRequest(new { message = "Unable to create external login callback URL." });

        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, callbackUrl);
        return Challenge(properties, provider);
    }

    [HttpGet("external/callback")]
    public async Task<IActionResult> ExternalLoginCallback([FromQuery] string? returnUrl = "/")
    {
        var normalizedReturnUrl = NormalizeReturnUrl(returnUrl);
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
            return Redirect(BuildFrontendRedirect("/login", "Unable to load external login information."));

        var signInResult = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: false,
            bypassTwoFactor: true);

        if (signInResult.Succeeded)
            return Redirect(BuildFrontendRedirect(normalizedReturnUrl, null));

        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
            return Redirect(BuildFrontendRedirect("/login", "Email not provided by external provider."));

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
                return Redirect(BuildFrontendRedirect("/login", "Unable to create user from external login."));

            if (await _userManager.IsInRoleAsync(user, AuthRoles.Customer) == false)
                await _userManager.AddToRoleAsync(user, AuthRoles.Customer);
        }

        var addLoginResult = await _userManager.AddLoginAsync(user, info);
        if (!addLoginResult.Succeeded &&
            addLoginResult.Errors.All(e => e.Code != "LoginAlreadyAssociated"))
        {
            return Redirect(BuildFrontendRedirect("/login", "Unable to link external login."));
        }

        await _signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
        return Redirect(BuildFrontendRedirect(normalizedReturnUrl, null));
    }

    private static string NormalizeReturnUrl(string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(returnUrl) || !returnUrl.StartsWith('/'))
            return "/";
        return returnUrl;
    }

    private string BuildFrontendRedirect(string path, string? error)
    {
        var frontendBaseUrl = _configuration["Auth:FrontendBaseUrl"] ?? "http://localhost:5173";
        var destination = $"{frontendBaseUrl.TrimEnd('/')}{path}";

        if (string.IsNullOrWhiteSpace(error))
            return destination;

        var separator = destination.Contains('?') ? '&' : '?';
        return $"{destination}{separator}error={Uri.EscapeDataString(error)}";
    }
}

public record LoginDto(string Email, string Password, string? TwoFactorCode, string? TwoFactorRecoveryCode);
public record RegisterDto(string Email, string Password, string? Role);
public record EnableTwoFactorDto(string Code);
