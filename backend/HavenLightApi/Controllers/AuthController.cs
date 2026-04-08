using System.Security.Claims;
using HavenLightApi.Data;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IConfiguration configuration,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("me")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCurrentSession()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new
            {
                isAuthenticated = false,
                userName = (string?)null,
                email = (string?)null,
                roles = Array.Empty<string>()
            });
        }

        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return Ok(new
            {
                isAuthenticated = false,
                userName = (string?)null,
                email = (string?)null,
                roles = Array.Empty<string>()
            });
        }

        var roles = (await userManager.GetRolesAsync(user)).Distinct().OrderBy(role => role).ToArray();

        return Ok(new
        {
            isAuthenticated = true,
            userName = user.DisplayName ?? user.UserName ?? User.Identity?.Name,
            email = user.Email,
            phoneNumber = user.PhoneNumber,
            currencyPreference = string.IsNullOrWhiteSpace(user.CurrencyPreference) ? "PHP" : user.CurrencyPreference,
            profileImageUrl = BuildAbsoluteProfileImageUrl(user.ProfileImageUrl),
            roles
        });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        return Ok(new
        {
            displayName = user.DisplayName ?? user.UserName ?? user.Email,
            email = user.Email,
            phoneNumber = user.PhoneNumber,
            currencyPreference = string.IsNullOrWhiteSpace(user.CurrencyPreference) ? "PHP" : user.CurrencyPreference,
            profileImageUrl = BuildAbsoluteProfileImageUrl(user.ProfileImageUrl),
        });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var currency = dto.CurrencyPreference?.Trim().ToUpperInvariant();
        if (currency is not ("PHP" or "USD"))
            return BadRequest(new { message = "Currency preference must be PHP or USD." });

        user.DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? user.DisplayName : dto.DisplayName.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty;
        user.CurrencyPreference = currency;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var msg = string.Join(' ', result.Errors.Select(e => e.Description));
            return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to update profile." : msg });
        }

        return Ok(new
        {
            message = "Profile updated.",
            displayName = user.DisplayName ?? user.UserName ?? user.Email,
            email = user.Email,
            phoneNumber = user.PhoneNumber,
            currencyPreference = user.CurrencyPreference,
            profileImageUrl = BuildAbsoluteProfileImageUrl(user.ProfileImageUrl),
        });
    }

    [HttpPost("profile-image")]
    [Authorize]
    [RequestSizeLimit(2 * 1024 * 1024)]
    public async Task<IActionResult> UploadProfileImage(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Please choose an image file." });
        if (file.Length > 2 * 1024 * 1024)
            return BadRequest(new { message = "Image must be 2MB or less." });
        if (string.IsNullOrWhiteSpace(file.ContentType) || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only image uploads are allowed." });

        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var uploadsDir = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "profile-images");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";
        var safeExt = ext.Length > 8 ? ".jpg" : ext.ToLowerInvariant();
        var fileName = $"{user.Id}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{safeExt}";
        var fullPath = Path.Combine(uploadsDir, fileName);

        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        if (!string.IsNullOrWhiteSpace(user.ProfileImageUrl))
        {
            var oldRelativePath = user.ProfileImageUrl;
            if (Uri.TryCreate(oldRelativePath, UriKind.Absolute, out var oldUri))
                oldRelativePath = oldUri.AbsolutePath;
            var oldFile = oldRelativePath.Replace("/profile-images/", "", StringComparison.OrdinalIgnoreCase);
            var oldPath = Path.Combine(uploadsDir, oldFile);
            if (System.IO.File.Exists(oldPath))
            {
                try { System.IO.File.Delete(oldPath); } catch { /* ignore old cleanup failures */ }
            }
        }

        user.ProfileImageUrl = $"/profile-images/{fileName}";
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var msg = string.Join(' ', result.Errors.Select(e => e.Description));
            return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to save profile image." : msg });
        }

        return Ok(new { profileImageUrl = BuildAbsoluteProfileImageUrl(user.ProfileImageUrl) });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await userManager.Users
            .OrderBy(u => u.Email ?? u.UserName)
            .Select(u => new
            {
                id = u.Id,
                userName = u.UserName,
                email = u.Email,
                lockoutEnabled = u.LockoutEnabled,
                lockoutEnd = u.LockoutEnd
            })
            .ToListAsync();

        var result = new List<object>(users.Count);
        foreach (var user in users)
        {
            var userEntity = await userManager.FindByIdAsync(user.id);
            var roles = userEntity is null
                ? Array.Empty<string>()
                : (await userManager.GetRolesAsync(userEntity)).OrderBy(r => r).ToArray();

            result.Add(new
            {
                user.id,
                user.userName,
                user.email,
                roles,
                status = user.lockoutEnd is not null && user.lockoutEnd > DateTimeOffset.UtcNow ? "Locked" : "Active"
            });
        }

        return Ok(result);
    }

    [HttpGet("providers")]
    [AllowAnonymous]
    public IActionResult GetExternalProviders()
    {
        var providers = new List<object>();

        if (IsGoogleConfigured())
        {
            providers.Add(new
            {
                name = GoogleDefaults.AuthenticationScheme,
                displayName = "Google"
            });
        }

        return Ok(providers);
    }

    [HttpGet("external-login")]
    [AllowAnonymous]
    public IActionResult ExternalLogin([FromQuery] string provider, [FromQuery] string? returnPath = null)
    {
        if (!string.Equals(provider, GoogleDefaults.AuthenticationScheme, StringComparison.OrdinalIgnoreCase)
            || !IsGoogleConfigured())
        {
            return BadRequest(new { message = "The requested external login provider is not supported." });
        }

        var callbackUrl = Url.Action(
            nameof(ExternalLoginCallback),
            values: new { returnPath = NormalizeReturnPath(returnPath) });

        if (string.IsNullOrWhiteSpace(callbackUrl))
        {
            return Problem("Unable to create the external login callback URL.");
        }

        var properties = signInManager.ConfigureExternalAuthenticationProperties(
            GoogleDefaults.AuthenticationScheme,
            callbackUrl);

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("external-callback")]
    [AllowAnonymous]
    public async Task<IActionResult> ExternalLoginCallback(
        [FromQuery] string? returnPath = null,
        [FromQuery] string? remoteError = null)
    {
        if (!string.IsNullOrWhiteSpace(remoteError))
        {
            return Redirect(BuildFrontendErrorUrl(remoteError));
        }

        var info = await signInManager.GetExternalLoginInfoAsync();
        if (info is null)
        {
            return Redirect(BuildFrontendErrorUrl("External login information was unavailable."));
        }

        var signInResult = await signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: false,
            bypassTwoFactor: true);

        if (signInResult.Succeeded)
        {
            return Redirect(BuildFrontendSuccessUrl(returnPath));
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email)
            ?? info.Principal.FindFirstValue("email");

        if (string.IsNullOrWhiteSpace(email))
        {
            return Redirect(BuildFrontendErrorUrl("Email address is missing."));
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var createUserResult = await userManager.CreateAsync(user);
            if (!createUserResult.Succeeded)
            {
                return Redirect(BuildFrontendErrorUrl("Failed to create a new user account."));
            }
        }

        var existingLogins = await userManager.GetLoginsAsync(user);
        var hasProviderLogin = existingLogins.Any(login =>
            string.Equals(login.LoginProvider, info.LoginProvider, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(login.ProviderKey, info.ProviderKey, StringComparison.Ordinal));

        if (!hasProviderLogin)
        {
            var addLoginResult = await userManager.AddLoginAsync(user, info);
            if (!addLoginResult.Succeeded)
            {
                return Redirect(BuildFrontendErrorUrl("Failed to add external login to the user account."));
            }
        }

        await signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
        return Redirect(BuildFrontendSuccessUrl(returnPath));
    }

    private bool IsGoogleConfigured()
    {
        return !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"])
            && !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]);
    }

    private string NormalizeReturnPath(string? returnPath)
    {
        if (string.IsNullOrWhiteSpace(returnPath) || !returnPath.StartsWith('/'))
        {
            return "/";
        }

        return returnPath;
    }

    private string BuildFrontendSuccessUrl(string? returnPath)
    {
        var baseUrl = (configuration["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
        var safeReturnPath = NormalizeReturnPath(returnPath);
        return $"{baseUrl}{safeReturnPath}";
    }

    private string BuildFrontendErrorUrl(string message)
    {
        var baseUrl = (configuration["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
        return QueryHelpers.AddQueryString($"{baseUrl}/login", "error", message);
    }

    private string? BuildAbsoluteProfileImageUrl(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) return null;
        if (Uri.TryCreate(imageUrl, UriKind.Absolute, out _)) return imageUrl;
        return $"{Request.Scheme}://{Request.Host}{imageUrl}";
    }
}

public record UpdateProfileDto(
    string? DisplayName,
    string? PhoneNumber,
    string? CurrencyPreference
);


