import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type AccessLevel = 'Admin' | 'Staff' | 'Viewer';
type UserStatus = 'Active' | 'Pending' | 'Suspended';

interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: AccessLevel;
  status: UserStatus;
  lastSeen: string;
}

const seedUsers: AdminUserRow[] = [
  { id: 1001, name: 'Maria Santos', email: 'maria.santos@havenlight.org', role: 'Admin', status: 'Active', lastSeen: '2 minutes ago' },
  { id: 1002, name: 'Alex Cruz', email: 'alex.cruz@havenlight.org', role: 'Staff', status: 'Active', lastSeen: '18 minutes ago' },
  { id: 1003, name: 'Nina Ramos', email: 'nina.ramos@havenlight.org', role: 'Viewer', status: 'Pending', lastSeen: 'Never signed in' },
  { id: 1004, name: 'Joshua Lim', email: 'joshua.lim@havenlight.org', role: 'Staff', status: 'Suspended', lastSeen: '6 days ago' },
];

export default function AdminPage() {
  const { isLoading, isAdmin, user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All');
  const [roleFilter, setRoleFilter] = useState<AccessLevel | 'All'>('All');

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return seedUsers.filter((row) => {
      const matchesSearch = term.length === 0 || row.name.toLowerCase().includes(term) || row.email.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const matchesRole = roleFilter === 'All' || row.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter]);

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading admin tools...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-xl border bg-card p-5 card-shadow">
          <h1 className="mt-0 font-heading text-2xl font-semibold text-foreground">Admin Access Required</h1>
          <p className="mb-0 text-muted-foreground">
            You are signed in as <strong>{user?.email ?? 'unknown user'}</strong>, but this page is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-1 font-heading text-3xl font-bold text-foreground">Admin User Management</h1>
      <p className="mb-5 mt-0 text-muted-foreground">
        Monitor account access, review status, and quickly search members of the admin portal.
      </p>

      <div className="mb-4 grid gap-3 rounded-xl border bg-card p-4 card-shadow md:grid-cols-[1.8fr_1fr_1fr]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search users"
          className={inputCn}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as UserStatus | 'All')}
          aria-label="Filter by status"
          className={inputCn}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as AccessLevel | 'All')}
          aria-label="Filter by role"
          className={inputCn}
        >
          <option value="All">All roles</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card card-shadow">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-muted/40 text-left">
              <th className={thCn}>Name</th>
              <th className={thCn}>Email</th>
              <th className={thCn}>Role</th>
              <th className={thCn}>Status</th>
              <th className={thCn}>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-muted-foreground">
                  No users match your current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className={tdCn}>
                    <div className="font-semibold text-foreground">{row.name}</div>
                  </td>
                  <td className={tdCn}>{row.email}</td>
                  <td className={tdCn}>
                    <span className={getRoleBadgeClass(row.role)}>{row.role}</span>
                  </td>
                  <td className={tdCn}>
                    <span className={getStatusBadgeClass(row.status)}>{row.status}</span>
                  </td>
                  <td className={tdCn}>{row.lastSeen}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputCn = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground';
const thCn = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const tdCn = 'px-4 py-3 text-sm text-foreground';

function getRoleBadgeClass(role: AccessLevel): string {
  const styles: Record<AccessLevel, string> = {
    Admin: 'text-primary bg-primary/10',
    Staff: 'text-success bg-success/10',
    Viewer: 'text-purple-700 bg-purple-100',
  };
  return `inline-block rounded-full px-2 py-1 text-xs font-bold ${styles[role]}`;
}

function getStatusBadgeClass(status: UserStatus): string {
  const styles: Record<UserStatus, string> = {
    Active: 'text-success bg-success/10',
    Pending: 'text-warning-foreground bg-warning/15',
    Suspended: 'text-destructive bg-destructive/10',
  };
  return `inline-block rounded-full px-2 py-1 text-xs font-bold ${styles[status]}`;
}