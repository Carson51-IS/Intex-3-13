using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IConfiguration _config;

    public AuthController(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IConfiguration config)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // Support login by username or email
        var user = await _userManager.FindByNameAsync(dto.Identifier)
                   ?? await _userManager.FindByEmailAsync(dto.Identifier);

        if (user == null)
            return Unauthorized(new { message = "Invalid credentials" });

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid credentials" });

        var token = await GenerateJwtToken(user);
        return Ok(new { token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username))
            return BadRequest(new { message = "Username is required." });

        if (await _userManager.FindByNameAsync(dto.Username) != null)
            return BadRequest(new { message = "That username is already taken." });

        if (!string.IsNullOrWhiteSpace(dto.Email) && await _userManager.FindByEmailAsync(dto.Email) != null)
            return BadRequest(new { message = "That email is already registered." });

        var user = new IdentityUser
        {
            UserName = dto.Username,
            Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email,
            EmailConfirmed = !string.IsNullOrWhiteSpace(dto.Email),
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        // Only allow Donor role from public registration
        await _userManager.AddToRoleAsync(user, "Donor");

        var token = await GenerateJwtToken(user);
        return Ok(new { token });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_config["Google:ClientId"]!],
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new { message = "Invalid Google token." });
        }

        // Check if we already linked this Google account
        var user = await _userManager.FindByLoginAsync("Google", payload.Subject);

        if (user == null)
        {
            // Check if a local account exists with the same email
            user = await _userManager.FindByEmailAsync(payload.Email);

            if (user == null)
            {
                // Create a new account — use email prefix as default username, ensure uniqueness
                var baseUsername = payload.Email.Split('@')[0];
                var username = baseUsername;
                var suffix = 1;
                while (await _userManager.FindByNameAsync(username) != null)
                    username = $"{baseUsername}{suffix++}";

                user = new IdentityUser
                {
                    UserName = username,
                    Email = payload.Email,
                    EmailConfirmed = true,
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                    return BadRequest(new { message = string.Join(" ", createResult.Errors.Select(e => e.Description)) });

                await _userManager.AddToRoleAsync(user, "Donor");
            }

            // Link the Google login to this account
            var loginInfo = new UserLoginInfo("Google", payload.Subject, "Google");
            await _userManager.AddLoginAsync(user, loginInfo);
        }

        var token = await GenerateJwtToken(user);
        return Ok(new { token });
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);
        var logins = await _userManager.GetLoginsAsync(user);

        return Ok(new
        {
            username = user.UserName,
            email = user.Email,
            roles,
            hasGoogle = logins.Any(l => l.LoginProvider == "Google"),
        });
    }

    private async Task<string> GenerateJwtToken(IdentityUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddMinutes(
            double.Parse(_config["Jwt:ExpirationMinutes"] ?? "60"));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginDto(string Identifier, string Password);
public record RegisterDto(string Username, string Password, string? Email);
public record GoogleLoginDto(string IdToken);
