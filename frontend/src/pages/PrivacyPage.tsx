export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="hero-gradient px-6 py-14 text-center text-primary-foreground">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-primary-foreground/85 md:text-base">
          Last updated: April 2026
        </p>
      </section>

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="rounded-xl border bg-card p-6 text-card-foreground card-shadow md:p-8">
      <h2 className="mt-0 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">1. Introduction</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Haven Light Philippines ("we", "our", or "us") is committed to protecting and respecting your privacy.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
        visit our website and use our services.
      </p>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">2. Data We Collect</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">We may collect the following categories of personal data:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        <li><strong>Account information:</strong> email address and password when you create a staff or donor account.</li>
        <li><strong>Donation data:</strong> contribution amounts, dates, and allocation preferences.</li>
        <li><strong>Usage data:</strong> pages visited, features used, browser type, and IP address.</li>
        <li><strong>Cookies:</strong> small text files stored on your device to improve your experience.</li>
      </ul>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">3. How We Use Your Data</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">We process your data for the following purposes:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>To provide, operate, and maintain our services.</li>
        <li>To authenticate users and manage accounts.</li>
        <li>To process and track donations.</li>
        <li>To communicate updates and impact reports to donors.</li>
        <li>To improve our website and services.</li>
      </ul>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">4. Legal Basis for Processing (GDPR)</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">Under the General Data Protection Regulation (GDPR), we process your data based on:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        <li><strong>Consent:</strong> You have given clear consent for us to process your personal data.</li>
        <li><strong>Contract:</strong> Processing is necessary to fulfill our obligations to you.</li>
        <li><strong>Legitimate interest:</strong> Processing is necessary for our legitimate organizational interests.</li>
      </ul>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">5. Data Retention</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        We retain your personal data only for as long as necessary to fulfill the purposes for which it was
        collected, including legal, accounting, and reporting requirements.
      </p>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">6. Your Rights</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">Under GDPR, you have the right to:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your data.</li>
        <li>Object to or restrict processing of your data.</li>
        <li>Request portability of your data.</li>
        <li>Withdraw consent at any time.</li>
      </ul>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">7. Cookies</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        We use cookies to enhance your browsing experience. You can control cookie preferences through our
        cookie consent banner. Essential cookies are required for the site to function. Analytics cookies
        help us understand usage patterns.
      </p>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">8. Data Security</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        We implement appropriate technical and organizational measures to protect your personal data,
        including encryption of data in transit (TLS/HTTPS), access controls, and secure credential storage.
      </p>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">9. Third-Party Disclosure</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        We do not sell, trade, or otherwise transfer your personal data to third parties without your consent,
        except as required by law or necessary for our operations (e.g., cloud hosting providers).
      </p>

      <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">10. Contact Us</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        If you have questions about this Privacy Policy or wish to exercise your rights, please contact us
        at <strong>privacy@havenlight.ph</strong>.
      </p>
        </div>
      </div>
    </div>
  );
}
