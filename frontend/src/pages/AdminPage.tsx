import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
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

const cardStyle: CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

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
    return <div style={{ padding: '2rem' }}>Loading admin tools...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ ...cardStyle, padding: '1.25rem' }}>
          <h1 style={{ marginTop: 0, color: '#1a365d' }}>Admin Access Required</h1>
          <p style={{ marginBottom: 0, color: '#4a5568' }}>
            You are signed in as <strong>{user?.email ?? 'unknown user'}</strong>, but this page is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '0.4rem' }}>Admin User Management</h1>
      <p style={{ color: '#4a5568', marginTop: 0, marginBottom: '1.25rem' }}>
        Monitor account access, review status, and quickly search members of the admin portal.
      </p>

      <div
        style={{
          ...cardStyle,
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr',
          gap: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search users"
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as UserStatus | 'All')}
          aria-label="Filter by status"
          style={inputStyle}
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
          style={inputStyle}
        >
          <option value="All">All roles</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '1rem', color: '#718096' }}>
                  No users match your current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((row) => (
                <tr key={row.id} style={{ borderTop: '1px solid #edf2f7' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: '#2d3748' }}>{row.name}</div>
                  </td>
                  <td style={tdStyle}>{row.email}</td>
                  <td style={tdStyle}>
                    <span style={getRoleBadgeStyle(row.role)}>{row.role}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={getStatusBadgeStyle(row.status)}>{row.status}</span>
                  </td>
                  <td style={tdStyle}>{row.lastSeen}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e0',
  borderRadius: '8px',
  padding: '0.6rem 0.75rem',
  fontSize: '0.95rem',
  color: '#2d3748',
};

const thStyle: CSSProperties = {
  padding: '0.85rem 1rem',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#4a5568',
};

const tdStyle: CSSProperties = {
  padding: '0.95rem 1rem',
  color: '#2d3748',
  fontSize: '0.92rem',
};

function getRoleBadgeStyle(role: AccessLevel): CSSProperties {
  const styles: Record<AccessLevel, CSSProperties> = {
    Admin: { color: '#2b6cb0', backgroundColor: '#ebf8ff' },
    Staff: { color: '#2f855a', backgroundColor: '#f0fff4' },
    Viewer: { color: '#6b46c1', backgroundColor: '#faf5ff' },
  };
  return {
    ...styles[role],
    display: 'inline-block',
    borderRadius: '9999px',
    padding: '0.2rem 0.55rem',
    fontSize: '0.78rem',
    fontWeight: 700,
  };
}

function getStatusBadgeStyle(status: UserStatus): CSSProperties {
  const styles: Record<UserStatus, CSSProperties> = {
    Active: { color: '#2f855a', backgroundColor: '#f0fff4' },
    Pending: { color: '#b7791f', backgroundColor: '#fffaf0' },
    Suspended: { color: '#c53030', backgroundColor: '#fff5f5' },
  };
  return {
    ...styles[status],
    display: 'inline-block',
    borderRadius: '9999px',
    padding: '0.2rem 0.55rem',
    fontSize: '0.78rem',
    fontWeight: 700,
  };
}