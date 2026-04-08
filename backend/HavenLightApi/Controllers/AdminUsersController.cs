using System.Security.Claims;
using HavenLightApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HavenLightApi.Controllers;

/// <summary>User CRUD under /api/admin/users — avoids collisions with Identity bearer endpoints mapped at /api/auth.</summary>
[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "AdminOnly")]
public class AdminUsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    /// <summary>Default seed admin (same email as AuthIdentityGenerator) — never deletable.</summary>
    private const string ProtectedSeedAdminEmail = "admin@havenlight.ph";

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await userManager.Users
            .OrderBy(u => u.Email ?? u.UserName)
            .Select(u => new
            {
                id = u.Id,
                userName = u.UserName,
                email = u.Email,
                displayName = u.DisplayName,
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
                user.displayName,
                roles,
                status = user.lockoutEnd is not null && user.lockoutEnd > DateTimeOffset.UtcNow ? "Locked" : "Active"
            });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserDto dto)
    {
        var email = dto.Email?.Trim();
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Email is required." });
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Password is required." });

        var parsed = ParseRoleList(dto.Roles);
        if (parsed is null)
            return BadRequest(new { message = "Invalid role. Allowed: User, Admin, Donor." });
        var roles = parsed.Count == 0 ? new List<string> { AuthRoles.User } : parsed;

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? null : dto.DisplayName.Trim()
        };

        var createResult = await userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            var msg = string.Join(' ', createResult.Errors.Select(e => e.Description));
            return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to create user." : msg });
        }

        foreach (var role in roles)
        {
            var addRole = await userManager.AddToRoleAsync(user, role);
            if (!addRole.Succeeded)
            {
                await userManager.DeleteAsync(user);
                var rmsg = string.Join(' ', addRole.Errors.Select(e => e.Description));
                return BadRequest(new { message = string.IsNullOrWhiteSpace(rmsg) ? "Failed to assign roles." : rmsg });
            }
        }

        return StatusCode(201, await BuildManagedUserAsync(user));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] AdminUpdateUserDto dto)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound(new { message = "User not found." });

        List<string>? rolesToApply = null;
        if (dto.Roles is not null)
        {
            var parsed = ParseRoleList(dto.Roles);
            if (parsed is null)
                return BadRequest(new { message = "Invalid role. Allowed: User, Admin, Donor." });
            rolesToApply = parsed.Count == 0 ? new List<string> { AuthRoles.User } : parsed;
            var guard = await TryEnsureLastAdminProtectedAsync(user, rolesToApply);
            if (guard is not null) return guard;
        }

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var newEmail = dto.Email.Trim();
            if (!string.Equals(user.Email, newEmail, StringComparison.OrdinalIgnoreCase))
            {
                var previousUserName = user.UserName;
                var setUser = await userManager.SetUserNameAsync(user, newEmail);
                if (!setUser.Succeeded)
                {
                    var msg = string.Join(' ', setUser.Errors.Select(e => e.Description));
                    return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to update login." : msg });
                }

                var setEmail = await userManager.SetEmailAsync(user, newEmail);
                if (!setEmail.Succeeded)
                {
                    await userManager.SetUserNameAsync(user, previousUserName ?? "");
                    var msg = string.Join(' ', setEmail.Errors.Select(e => e.Description));
                    return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to update email." : msg });
                }

                user.EmailConfirmed = true;
            }
        }

        if (dto.DisplayName is not null)
            user.DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? null : dto.DisplayName.Trim();

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var msg = string.Join(' ', updateResult.Errors.Select(e => e.Description));
            return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to update user." : msg });
        }

        if (rolesToApply is not null)
        {
            user = await userManager.FindByIdAsync(id) ?? user;
            var currentRoles = await userManager.GetRolesAsync(user);
            foreach (var r in currentRoles.Except(rolesToApply, StringComparer.Ordinal))
            {
                var rem = await userManager.RemoveFromRoleAsync(user, r);
                if (!rem.Succeeded)
                {
                    var msg = string.Join(' ', rem.Errors.Select(e => e.Description));
                    return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to update roles." : msg });
                }
            }

            foreach (var r in rolesToApply.Except(currentRoles, StringComparer.Ordinal))
            {
                var add = await userManager.AddToRoleAsync(user, r);
                if (!add.Succeeded)
                {
                    var msg = string.Join(' ', add.Errors.Select(e => e.Description));
                    return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to update roles." : msg });
                }
            }
        }

        user = await userManager.FindByIdAsync(id) ?? user;
        return Ok(await BuildManagedUserAsync(user));
    }

    [HttpPut("{id}/lockout")]
    public async Task<IActionResult> SetUserLockout(string id, [FromBody] AdminLockoutDto dto)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound(new { message = "User not found." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.Equals(currentUserId, id, StringComparison.Ordinal))
            return BadRequest(new { message = "You cannot lock or unlock your own account here." });

        if (dto.Locked)
        {
            if (await userManager.IsInRoleAsync(user, AuthRoles.Admin))
            {
                var admins = await userManager.GetUsersInRoleAsync(AuthRoles.Admin);
                if (admins.Count == 1)
                    return BadRequest(new { message = "Cannot lock the only administrator account." });
            }

            await userManager.SetLockoutEnabledAsync(user, true);
            var lockResult = await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
            if (!lockResult.Succeeded)
            {
                var msg = string.Join(' ', lockResult.Errors.Select(e => e.Description));
                return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to lock account." : msg });
            }
        }
        else
        {
            await userManager.SetLockoutEnabledAsync(user, true);
            var unlockResult = await userManager.SetLockoutEndDateAsync(user, null);
            if (!unlockResult.Succeeded)
            {
                var msg = string.Join(' ', unlockResult.Errors.Select(e => e.Description));
                return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to unlock account." : msg });
            }
        }

        user = await userManager.FindByIdAsync(id) ?? user;
        return Ok(await BuildManagedUserAsync(user));
    }

    [HttpPost("{id}/password")]
    public async Task<IActionResult> SetUserPassword(string id, [FromBody] AdminSetPasswordDto dto)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound(new { message = "User not found." });

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest(new { message = "New password is required." });

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var reset = await userManager.ResetPasswordAsync(user, token, dto.NewPassword);
        if (!reset.Succeeded)
        {
            var msg = string.Join(' ', reset.Errors.Select(e => e.Description));
            return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to set password." : msg });
        }

        return Ok(new { message = "Password updated." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound(new { message = "User not found." });

        if (string.Equals(user.Email, ProtectedSeedAdminEmail, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "This account cannot be deleted." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.Equals(currentUserId, id, StringComparison.Ordinal))
            return BadRequest(new { message = "You cannot delete your own account." });

        if (await userManager.IsInRoleAsync(user, AuthRoles.Admin))
        {
            var admins = await userManager.GetUsersInRoleAsync(AuthRoles.Admin);
            if (admins.Count == 1)
                return BadRequest(new { message = "Cannot delete the only administrator account." });
        }

        var del = await userManager.DeleteAsync(user);
        if (!del.Succeeded)
        {
            var msg = string.Join(' ', del.Errors.Select(e => e.Description));
            return BadRequest(new { message = string.IsNullOrWhiteSpace(msg) ? "Failed to delete user." : msg });
        }

        return NoContent();
    }

    private static readonly string[] ValidRoles = [AuthRoles.User, AuthRoles.Admin, AuthRoles.Donor];

    private static List<string>? ParseRoleList(string[]? roles)
    {
        if (roles is null || roles.Length == 0)
            return [];

        var normalized = new List<string>();
        foreach (var r in roles)
        {
            if (string.IsNullOrWhiteSpace(r)) continue;
            var match = ValidRoles.FirstOrDefault(v => string.Equals(v, r.Trim(), StringComparison.OrdinalIgnoreCase));
            if (match is null) return null;
            if (!normalized.Contains(match, StringComparer.Ordinal))
                normalized.Add(match);
        }

        return normalized;
    }

    private async Task<IActionResult?> TryEnsureLastAdminProtectedAsync(ApplicationUser target, IReadOnlyList<string> newRoles)
    {
        if (!await userManager.IsInRoleAsync(target, AuthRoles.Admin))
            return null;

        if (newRoles.Contains(AuthRoles.Admin, StringComparer.Ordinal))
            return null;

        var admins = await userManager.GetUsersInRoleAsync(AuthRoles.Admin);
        return admins.Count == 1
            ? BadRequest(new { message = "Cannot remove the Administrator role from the only administrator." })
            : null;
    }

    private async Task<object> BuildManagedUserAsync(ApplicationUser user)
    {
        var fresh = await userManager.FindByIdAsync(user.Id) ?? user;
        var roles = (await userManager.GetRolesAsync(fresh)).OrderBy(r => r).ToArray();
        var locked = fresh.LockoutEnd is not null && fresh.LockoutEnd > DateTimeOffset.UtcNow;
        return new
        {
            id = fresh.Id,
            userName = fresh.UserName,
            email = fresh.Email,
            displayName = fresh.DisplayName,
            roles,
            status = locked ? "Locked" : "Active"
        };
    }
}

public record AdminCreateUserDto(
    string Email,
    string Password,
    string? DisplayName,
    string[]? Roles
);

public record AdminUpdateUserDto(
    string? Email,
    string? DisplayName,
    string[]? Roles
);

public record AdminLockoutDto(bool Locked);

public record AdminSetPasswordDto(string NewPassword);
