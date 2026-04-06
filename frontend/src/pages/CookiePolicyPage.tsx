export default function CookiePolicyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem', color: '#2d3748', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '2rem', color: '#1a365d', marginBottom: '1.5rem' }}>Cookie Policy</h1>
      <p><em>Last updated: April 2026</em></p>

      <p>
        We use cookies that are necessary for security, authentication, and core site functionality.
        These cookies help keep your account safe and allow protected features to work.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Essential Cookies We Use</h2>
      <ul>
        <li><strong>Identity cookies:</strong> keep users signed in and protect authenticated sessions.</li>
        <li><strong>Antiforgery/security cookies:</strong> help prevent cross-site request forgery and abuse.</li>
        <li><strong>Preference cookies:</strong> remember consent acknowledgement in this browser.</li>
      </ul>

      <h2 style={{ marginTop: '1.5rem' }}>Why We Use Them</h2>
      <p>
        These cookies are required for core functionality such as login, account security, and basic site
        behavior. The application may not work properly without them.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Your Choices</h2>
      <p>
        You can clear cookies from your browser at any time. Doing so may sign you out and reset
        preferences, including cookie acknowledgement.
      </p>
    </div>
  );
}
