import AdminLayout from '../../components/AdminLayout';

export default function UserManagementPage() {
  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">User Management</h1>
        <p className="mb-6 font-body text-muted-foreground">
          Manage admin accounts, donor users, role assignments, and account access controls.
        </p>

        <div className="rounded-xl border bg-card p-5 card-shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-card-foreground">Team Members</h2>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95">
              + Add User
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Role</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 text-foreground">Admin User</td>
                  <td className="px-4 py-3 text-muted-foreground">admin@havenlight.ph</td>
                  <td className="px-4 py-3 text-foreground">Admin</td>
                  <td className="px-4 py-3 text-success">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
