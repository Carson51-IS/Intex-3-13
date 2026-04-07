import AdminLayout from '../../components/AdminLayout';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">Settings</h1>
        <p className="mb-6 font-body text-muted-foreground">
          Configure admin portal preferences, organization options, and system defaults.
        </p>

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
            <h2 className="font-heading text-xl font-semibold text-card-foreground">Security</h2>
            <p className="mt-2 text-sm text-muted-foreground">Password policy, session timeout, and login protections.</p>
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
