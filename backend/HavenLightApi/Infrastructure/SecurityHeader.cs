using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HavenLightApi.Infrastructure;

public static class SecurityHeader
{
    public const string ContentSecurityPolicy =
        "default-src 'self'; frame-ancestors 'none'; object-src 'none'";

    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        var environment = app.ApplicationServices.GetRequiredService<IHostEnvironment>();

        return app.Use(async (context, next) =>
        {
            if (!(environment.IsDevelopment() &&
                    context.Request.Path.StartsWithSegments("/swagger")))
            {
                context.Response.Headers["Content-Security-Policy"] = ContentSecurityPolicy;
            }

            await next();
        });
    }
}
