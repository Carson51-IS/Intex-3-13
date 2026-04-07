import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';
import { useAuth } from '../context/AuthContext';

const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', exact: true },
      { path: '/admin/reports', label: 'Report & Analytics' },
    ],
  },
  {
    title: 'Donors Management',
    items: [{ path: '/admin/donors', label: 'Donors & Contributions' }],
  },
  {
    title: 'Case Management',
    items: [{ path: '/admin/residents', label: 'Caseload Inventory' }],
  },
  {
    title: 'Settings',
    items: [
      { path: '/admin/settings', label: 'Settings' },
      { path: '/admin/users', label: 'User Management' },
    ],
  },
];

function toDisplayName(userNameOrEmail?: string, email?: string) {
  const raw = (userNameOrEmail && userNameOrEmail.trim()) || (email && email.trim()) || 'Admin User';
  const local = raw.includes('@') ? raw.split('@')[0] : raw;
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const displayName = toDisplayName(user?.username, user?.email ?? undefined);
  const email = user?.email ?? 'admin@havenlight.ph';

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center border-b border-sidebar-border/70 px-5">
          <div className="flex items-center gap-2">
            <img src={havenLightLogoMark} alt="Haven Light logo mark" className="h-8 w-auto" />
            <div className="leading-tight">
              <div className="font-heading text-base font-semibold text-white">Admin Portal</div>
              <div className="text-[11px] tracking-[0.12em] text-sidebar-foreground/70">HAVEN LIGHT</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/60">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-sidebar-border/70 px-4 py-4">
          <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/60 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {(displayName[0] ?? 'A').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{displayName}</div>
              <div className="truncate text-xs text-sidebar-foreground/75">{email}</div>
            </div>
          </div>
          <Link
            to="/"
            className="block rounded-md px-3 py-2 text-center text-xs font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/40 hover:text-white"
          >
            View public site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md border border-sidebar-border/80 bg-transparent px-3 py-2 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
