import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">Settings</h1>
        <p className="mb-6 font-body text-muted-foreground">
          Configure admin portal preferences, organization options, and system defaults.
        </p>

        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5 card-shadow md:p-6">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Two-factor authentication (MFA)
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Add an extra layer of security to your account with an authenticator app. After MFA is enabled,
            you will enter a code from the app when you sign in.
          </p>
          <Link
            to="/manage-mfa"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground no-underline transition-opacity hover:opacity-90"
          >
            Set up or manage MFA
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <h2 className="font-heading text-xl font-semibold text-card-foreground">Organization</h2>
            <p className="mt-2 text-sm text-muted-foreground">Name, branding assets, and operating location settings.</p>
          </div>
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <h2 className="font-heading text-xl font-semibold text-card-foreground">Notifications</h2>
            <p className="mt-2 text-sm text-muted-foreground">Email alerts and event notifications for critical updates.</p>
          </div>
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <h2 className="font-heading text-xl font-semibold text-card-foreground">Security policy</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Organization-wide password policy, session timeout, and login protections (coming soon).
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <h2 className="font-heading text-xl font-semibold text-card-foreground">Integrations</h2>
            <p className="mt-2 text-sm text-muted-foreground">External connections for analytics and operational tooling.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
