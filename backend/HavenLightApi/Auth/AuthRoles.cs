namespace HavenLightApi.Auth;

public static class AuthRoles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";
    // Backward-compatible legacy role used in earlier auth iterations.
    public const string Donor = "Donor";
}
