function CookiePolicyPage() {
    return (
        <div className="mx-auto w-full max-w-5xl px-5 py-10">
            <div className="rounded-xl border bg-card p-8 card-shadow">
                <h1 className="mb-2 font-heading text-4xl font-bold text-foreground">
                    Cookie Policy
                </h1>
                <p className="mb-6 text-muted-foreground">
                    Last updated: April 2026
                </p>

                <p className="mb-5 text-sm leading-relaxed text-foreground">
                    This teaching app uses a small set of cookies required for secure authentication and
                    external login. We do not use marketing or ad-tracking cookies at this time.
                </p>

                <h2 className="mb-3 font-heading text-2xl font-semibold text-primary">
                    Essential Cookies We Use
                </h2>
                <ul className="mb-5 list-disc space-y-2 pl-5 text-foreground">
                    <li>
                        <strong>Authentication</strong>
                        <div className="mt-1 text-sm text-muted-foreground">
                            Keeps you signed in and allows access to protected pages.
                        </div>
                    </li>
                    <li>
                        <strong>External Login</strong>
                        <div className="mt-1 text-sm text-muted-foreground">
                            Supports sign-in with Google or other configured providers.
                        </div>
                    </li>
                </ul>

                <div className="rounded-lg border border-info/30 bg-info/10 px-4 py-3 text-sm text-foreground">
                    You can acknowledge cookie usage through the cookie banner shown in the app.
                </div>
            </div>
        </div>
    );
}

export default CookiePolicyPage;