using System.Security.Claims;
using HavenLightApi.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;

namespace HavenLightApi.Infrastructure;

/// <summary>
/// Replaces role claims on every authenticated request with the current roles from the database.
/// This guarantees <c>[Authorize(Roles = "Admin")]</c> always reflects up-to-date role assignments,
/// regardless of whether the user authenticated via a cookie (Google / external) or a Bearer JWT.
/// </summary>
public class RoleClaimsTransformation(UserManager<ApplicationUser> userManager) : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
            return principal;

        var user = await userManager.GetUserAsync(principal);
        if (user is null)
            return principal;

        var dbRoles = await userManager.GetRolesAsync(user);

        var staleRoleClaims = identity.FindAll(identity.RoleClaimType).ToList();
        foreach (var claim in staleRoleClaims)
            identity.RemoveClaim(claim);

        foreach (var role in dbRoles)
            identity.AddClaim(new Claim(identity.RoleClaimType, role));

        return principal;
    }
}
