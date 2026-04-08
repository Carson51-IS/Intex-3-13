using Microsoft.AspNetCore.Identity;

namespace HavenLightApi.Data;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string CurrencyPreference { get; set; } = "PHP";
    public string? ProfileImageUrl { get; set; }
}