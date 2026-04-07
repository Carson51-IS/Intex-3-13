import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

const navItems = [
  { path: '/admin', label: 'Dashboard', exact: true },
  { path: '/admin/residents', label: 'Caseload Inventory' },
  { path: '/admin/donors', label: 'Donors & Contributions' },
  { path: '/admin/reports', label: 'Reports & Analytics' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 130px)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        backgroundColor: '#1a2a4a',
        color: 'white',
        paddingTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '0 1.25rem 1rem',
          fontSize: '0.7rem',
          color: '#718096',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '0.5rem',
        }}>
          Staff Portal
        </div>
        <nav>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'block',
                  padding: '0.7rem 1.25rem',
                  color: isActive ? '#fff' : '#a0aec0',
                  backgroundColor: isActive ? 'rgba(66,153,225,0.18)' : 'transparent',
                  textDecoration: 'none',
                  borderLeft: `3px solid ${isActive ? '#4299e1' : 'transparent'}`,
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'background 0.15s',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#f7fafc' }}>
        {children}
      </div>
    </div>
  );
}
