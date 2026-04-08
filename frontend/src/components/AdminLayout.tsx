import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';
import { useAuth } from '../context/AuthContext';
import {
  ACCOUNT_PREFERENCES_UPDATED_EVENT,
  getAccountPreferences,
} from '../lib/accountPreferences';

const mlInsightsPaths = [
  '/admin/insights',
  '/admin/donor-insights',
  '/admin/resident-insights',
  '/admin/social-insights',
] as const;

const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', exact: true },
      { path: '/admin/insights', label: 'ML-Powered Insights', matchPaths: mlInsightsPaths },
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
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [profileImageDataUrl, setProfileImageDataUrl] = useState('');

  const handleLogout = () => {
    // Use the same flow as the public navbar: clears token in localStorage and refreshes session.
    navigate('/logout');
  };
  const email = user?.email ?? 'admin@havenlight.ph';

  const loadProfilePrefs = () => {
    const fallbackName = toDisplayName(user?.userName ?? undefined, user?.email ?? undefined);
    if (!user?.email) {
      setDisplayName(fallbackName);
      setProfileImageDataUrl('');
      return;
    }
    const prefs = getAccountPreferences(user.email, fallbackName);
    setDisplayName(prefs.displayName || fallbackName);
    setProfileImageDataUrl(prefs.profileImageDataUrl);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    loadProfilePrefs();
  }, [user?.email, user?.userName]);

  useEffect(() => {
    const onPrefsUpdated = () => loadProfilePrefs();
    window.addEventListener(ACCOUNT_PREFERENCES_UPDATED_EVENT, onPrefsUpdated);
    window.addEventListener('focus', onPrefsUpdated);
    return () => {
      window.removeEventListener(ACCOUNT_PREFERENCES_UPDATED_EVENT, onPrefsUpdated);
      window.removeEventListener('focus', onPrefsUpdated);
    };
  }, [user?.email, user?.userName]);

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
                  const isActive =
                    'matchPaths' in item && item.matchPaths
                      ? item.matchPaths.some(
                          (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
                        )
                      : item.exact
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path);
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

        <div className="mt-auto border-t border-sidebar-border/70 px-4 py-4">
          <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/60 p-3">
            {profileImageDataUrl ? (
              <img
                src={profileImageDataUrl}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                {(displayName[0] ?? 'A').toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{displayName}</div>
              <div className="truncate text-xs text-sidebar-foreground/75">{email}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-background/90 px-6 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-foreground">{displayName}</div>
              <div className="text-xs text-muted-foreground">{email}</div>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary/15"
                aria-label="Open account menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                {profileImageDataUrl ? (
                  <img
                    src={profileImageDataUrl}
                    alt="Account"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-3.71 0-6.75 2.44-6.75 5.44a.75.75 0 0 0 .75.75h12a.75.75 0 0 0 .75-.75C18.75 16.44 15.71 14 12 14Z" />
                  </svg>
                )}
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-11 z-50 w-44 rounded-md border border-border bg-card p-1 shadow-lg"
                >
                  <Link
                    to="/admin/account-settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm text-foreground no-underline transition-colors hover:bg-muted"
                  >
                    Account settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full rounded px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
