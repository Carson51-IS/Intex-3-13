import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

interface ManagedUser {
  id: string;
  userName: string | null;
  email: string | null;
  roles: string[];
  status: 'Active' | 'Locked';
}

function displayNameForUser(user: ManagedUser): string {
  const source = (user.userName ?? user.email ?? '').trim();
  if (!source) return 'Unknown User';
  const local = source.includes('@') ? source.split('@')[0] : source;
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<ManagedUser[]>('/auth/users');
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load users.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <span className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {users.length} account{users.length === 1 ? '' : 's'}
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

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
                {isLoading ? (
                  <tr className="border-b">
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Loading users…</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No user accounts found.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-3 text-foreground">{displayNameForUser(user)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground">{user.roles.length ? user.roles.join(', ') : 'Unassigned'}</td>
                      <td className={`px-4 py-3 ${user.status === 'Active' ? 'text-success' : 'text-warning'}`}>{user.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
