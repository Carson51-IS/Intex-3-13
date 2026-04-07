function CookiePolicyPage() {
    return (
        <div
            style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '2.5rem 1.25rem',
            }}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    padding: '2rem',
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        marginBottom: '0.5rem',
                        color: '#1a365d',
                        fontSize: '1.9rem',
                    }}
                >
                    Cookie Policy
                </h1>
                <p style={{ margin: 0, marginBottom: '1.5rem', color: '#4a5568' }}>
                    Last updated: April 2026
                </p>

                <p style={{ marginTop: 0, marginBottom: '1.25rem', color: '#2d3748', lineHeight: 1.7 }}>
                    This teaching app uses a small set of cookies required for secure authentication and
                    external login. We do not use marketing or ad-tracking cookies at this time.
                </p>

                <h2 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#2b6cb0', fontSize: '1.2rem' }}>
                    Essential Cookies We Use
                </h2>
                <ul style={{ marginTop: 0, marginBottom: '1.25rem', paddingLeft: '1.25rem', color: '#2d3748' }}>
                    <li style={{ marginBottom: '0.6rem' }}>
                        <strong>Authentication</strong>
                        <div style={{ color: '#4a5568', marginTop: '0.25rem' }}>
                            Keeps you signed in and allows access to protected pages.
                        </div>
                    </li>
                    <li>
                        <strong>External Login</strong>
                        <div style={{ color: '#4a5568', marginTop: '0.25rem' }}>
                            Supports sign-in with Google or other configured providers.
                        </div>
                    </li>
                </ul>

                <div
                    style={{
                        backgroundColor: '#ebf8ff',
                        color: '#2a4365',
                        border: '1px solid #bee3f8',
                        borderRadius: '8px',
                        padding: '0.9rem 1rem',
                        fontSize: '0.95rem',
                    }}
                >
                    You can acknowledge cookie usage through the cookie banner shown in the app.
                </div>
            </div>
        </div>
    );
}

export default CookiePolicyPage;