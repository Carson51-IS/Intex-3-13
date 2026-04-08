namespace HavenLightApi;

/// <summary>
/// Google OAuth values from configuration. Azure App Settings map to env vars (e.g. Authentication__Google__ClientId);
/// we also read those directly so a rare provider-order issue cannot hide them from IConfiguration.
/// </summary>
internal static class GoogleConfigurationReader
{
    public static (string? ClientId, string? ClientSecret) Resolve(IConfiguration configuration)
    {
        string? id = configuration["Authentication:Google:ClientId"]
            ?? configuration["Authentication:Google:ClientID"]
            ?? configuration["Google:ClientId"];
        string? secret = configuration["Authentication:Google:ClientSecret"]
            ?? configuration["Google:ClientSecret"];

        if (string.IsNullOrWhiteSpace(id))
        {
            id = Environment.GetEnvironmentVariable("Authentication__Google__ClientId")
                ?? Environment.GetEnvironmentVariable("Authentication__Google__ClientID")
                ?? Environment.GetEnvironmentVariable("Google__ClientId");
        }

        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = Environment.GetEnvironmentVariable("Authentication__Google__ClientSecret")
                ?? Environment.GetEnvironmentVariable("Google__ClientSecret");
        }

        return (TrimOrNull(id), TrimOrNull(secret));
    }

    public static bool IsFullyConfigured(IConfiguration configuration)
    {
        var (id, secret) = Resolve(configuration);
        return !string.IsNullOrWhiteSpace(id) && !string.IsNullOrWhiteSpace(secret);
    }

    private static string? TrimOrNull(string? s)
    {
        if (string.IsNullOrWhiteSpace(s))
            return null;
        return s.Trim();
    }
}
