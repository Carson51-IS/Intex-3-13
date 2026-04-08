import { Link } from 'react-router-dom';

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
          <h2 className="mt-0 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            1. Who We Are (Data Controller)
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Haven Light Philippines (“Haven Light”, “we”, “our”, or “us”) is the controller of the personal data described in this Privacy Policy.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li><strong>Organization:</strong> Haven Light Philippines</li>
            <li><strong>Email:</strong> <a className="font-semibold text-primary no-underline hover:underline" href="mailto:privacy@havenlight.ph">privacy@havenlight.ph</a></li>
            <li><strong>General contact:</strong> info@havenlight.ph</li>
            <li><strong>Phone:</strong> +63 (2) 8123-4567</li>
            <li><strong>Address:</strong> Metro Manila, Philippines</li>
            <li><strong>Data protection contact (DPO/Privacy lead):</strong> [Name/Title]</li>
          </ul>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            2. Scope
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            This Privacy Policy applies to our website and the donor and staff portals available through this site (together, the “Services”).
            It explains what personal data we collect, why we collect it, how we use it, and the rights available to you.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            3. Personal Data We Collect
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We collect the following categories of personal data, depending on how you use the Services:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li><strong>Account data:</strong> email address, login credentials, and profile preferences (such as display name and profile image, if provided).</li>
            <li><strong>Donation and transaction records:</strong> donation amounts, dates, and donation-related preferences you select in the Services.</li>
            <li><strong>Communications:</strong> messages you send to us (for example, support requests or inquiries).</li>
            <li><strong>Device and usage data:</strong> IP address, browser type, pages viewed, and actions taken in the Services.</li>
            <li><strong>Cookie and consent data:</strong> your cookie preferences and related identifiers required to remember those choices.</li>
          </ul>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We do not request sensitive categories of personal data (such as health information, biometric identifiers, or political opinions) through the public parts of this site.
            If you provide sensitive information to us in free-text fields, you do so at your discretion.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            4. How We Collect Personal Data
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li><strong>Directly from you:</strong> when you create an account, donate, contact us, or update your preferences.</li>
            <li><strong>Automatically:</strong> when you use the Services (for example, through server logs and cookies).</li>
            <li><strong>From third parties (if applicable):</strong> [Payment processor / Email delivery provider / Analytics provider].</li>
          </ul>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            5. Purposes and Legal Bases (GDPR)
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If the GDPR applies to you (for example, if you are in the EU/EEA/UK), we process personal data only when we have a lawful basis.
            Below are the main purposes for processing and the typical legal bases we rely on:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li><strong>Provide the Services, authenticate users, and manage accounts</strong> (contract; legitimate interests).</li>
            <li><strong>Process and record donations and maintain donor history</strong> (contract; legal obligation; legitimate interests).</li>
            <li><strong>Respond to inquiries and provide support</strong> (legitimate interests; contract where the request relates to an account).</li>
            <li><strong>Improve reliability, security, and performance of the Services</strong> (legitimate interests).</li>
            <li><strong>Store your cookie preferences and operate optional cookies</strong> (consent for non-essential cookies; legitimate interests for strictly necessary cookies).</li>
          </ul>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Where we rely on consent, you can withdraw it at any time by adjusting your cookie preferences or contacting us.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            6. Sharing and Recipients
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We share personal data only with recipients that support operating the Services, and only to the extent necessary:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li><strong>Service providers:</strong> hosting, database, security, and email delivery providers.</li>
            <li><strong>Payment and financial providers (if applicable):</strong> [Payment processor name] for donation processing and related fraud prevention.</li>
            <li><strong>Professional advisers:</strong> auditors, legal counsel, and similar advisers where needed.</li>
            <li><strong>Legal and safety disclosures:</strong> when required by law or to protect rights, safety, and security.</li>
          </ul>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We do not sell your personal data.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            7. International Transfers
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Your personal data may be processed in countries other than your own, depending on where our service providers operate.
            Where GDPR applies and we transfer personal data outside the EEA/UK/Switzerland, we use appropriate safeguards such as Standard Contractual Clauses (SCCs) or an adequacy decision, as applicable.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            <strong>Implementation detail:</strong> [List key processors and their data-processing locations/safeguards once confirmed.]
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            8. Data Retention
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We keep personal data only for as long as necessary for the purposes described in this policy, and to meet legal, accounting, and security requirements.
            Retention periods depend on the type of data:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li><strong>Account data:</strong> retained for as long as your account is active, then deleted or anonymized within [X days/months] unless we must retain it for legal or security reasons.</li>
            <li><strong>Donation records:</strong> retained for [X years] to meet tax, accounting, and audit obligations.</li>
            <li><strong>Security logs:</strong> retained for [X days/months] for troubleshooting and security monitoring.</li>
            <li><strong>Cookie preferences:</strong> retained for [X months] or until you change them.</li>
          </ul>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            9. Your Rights (GDPR)
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If GDPR applies to you, you have the right to request:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li><strong>Access</strong> to your personal data.</li>
            <li><strong>Rectification</strong> of inaccurate or incomplete personal data.</li>
            <li><strong>Erasure</strong> of personal data, where the law allows.</li>
            <li><strong>Restriction</strong> of processing, in certain circumstances.</li>
            <li><strong>Objection</strong> to processing based on legitimate interests, in certain circumstances.</li>
            <li><strong>Data portability</strong> for personal data you provided to us, where applicable.</li>
            <li><strong>Withdrawal of consent</strong> at any time where processing is based on consent.</li>
          </ul>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            To exercise these rights, email <a className="font-semibold text-primary no-underline hover:underline" href="mailto:privacy@havenlight.ph">privacy@havenlight.ph</a>.
            We may request information to confirm your identity before responding. We aim to respond within one month, unless the law allows additional time.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            10. Complaints
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If GDPR applies and you believe we have not handled your concern appropriately, you have the right to lodge a complaint with a supervisory authority in your country of residence, place of work, or where the alleged infringement occurred.
            You can also contact us first at <a className="font-semibold text-primary no-underline hover:underline" href="mailto:privacy@havenlight.ph">privacy@havenlight.ph</a>.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            11. Cookies
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We use cookies to operate the Services and remember your preferences. You can review cookie details in our{' '}
            <Link to="/cookies" className="font-semibold text-primary no-underline hover:underline">
              Cookie Policy
            </Link>
            . You can change cookie settings at any time using the cookie consent banner.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            12. Security
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We use technical and organizational measures designed to protect personal data, including access controls and encryption in transit (TLS/HTTPS).
            No method of transmission or storage is completely secure, but we work to reduce risk and continuously improve our safeguards.
          </p>

          <h2 className="mt-8 border-l-4 border-primary pl-3 font-heading text-2xl font-semibold">
            13. Changes to This Policy
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We update this Privacy Policy from time to time. We post updates on this page and revise the “Last updated” date above.
          </p>
        </div>
      </div>
    </div>
  );
}
