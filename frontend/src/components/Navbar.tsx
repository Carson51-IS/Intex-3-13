import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ACCOUNT_PREFERENCES_UPDATED_EVENT,
  getAccountPreferences,
} from '../lib/accountPreferences';
import { resolveProfileImageSrc } from '../lib/profileImage';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin, isDonor } = useAuth();
  const isRegularUser = Boolean(user && !isAdmin && !isDonor);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [profileImageDataUrl, setProfileImageDataUrl] = useState('');

  const loadProfilePrefs = () => {
    if (!user) return;
    const defaultName = user.userName?.trim() || user.email.split('@')[0] || user.email;
    const prefs = getAccountPreferences(user.email, defaultName);
    setDisplayName(prefs.displayName);
    const raw = user.profileImageUrl?.trim() || prefs.profileImageDataUrl || '';
    setProfileImageDataUrl(raw);
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
    if (!mobileNavOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (mobileNavRef.current && target && !mobileNavRef.current.contains(target)) {
        setMobileNavOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    loadProfilePrefs();
  }, [user]);

  useEffect(() => {
    const onPrefsUpdated = () => loadProfilePrefs();
    window.addEventListener(ACCOUNT_PREFERENCES_UPDATED_EVENT, onPrefsUpdated);
    window.addEventListener('focus', onPrefsUpdated);
    return () => {
      window.removeEventListener(ACCOUNT_PREFERENCES_UPDATED_EVENT, onPrefsUpdated);
      window.removeEventListener('focus', onPrefsUpdated);
    };
  }, [user]);

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-1 no-underline">
          <img src={havenLightLogoMark} alt="Haven Light logo mark" className="h-10 w-auto" />
          <div className="leading-tight">
            <div className="font-heading text-lg font-semibold text-foreground">Haven Light</div>
            <div className="font-body text-xs tracking-[0.18em] text-muted-foreground">PHILIPPINES</div>
          </div>
        </Link>
        {isLoading ? (
          <span className="text-sm text-muted-foreground">Loading…</span>
        ) : (
          <>
            <div className="md:hidden" ref={mobileNavRef}>
              <button
                type="button"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground"
                aria-label="Toggle navigation"
                aria-expanded={mobileNavOpen}
                aria-haspopup="menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {mobileNavOpen ? (
                <div
                  role="menu"
                  className="absolute right-6 top-14 z-50 w-56 rounded-md border border-border bg-card p-2 shadow-lg"
                >
                  {!isRegularUser ? (
                    <>
                      <a href="/#mission" onClick={() => setMobileNavOpen(false)} className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted">Mission</a>
                      <a href="/#impact" onClick={() => setMobileNavOpen(false)} className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted">Impact</a>
                      <Link to="/gallery" onClick={() => setMobileNavOpen(false)} className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted">Gallery</Link>
                      <a href="/#how" onClick={() => setMobileNavOpen(false)} className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted">How It Works</a>
                      <a href="/#donate" onClick={() => setMobileNavOpen(false)} className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted">Donate</a>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/donations"
                        onClick={() => setMobileNavOpen(false)}
                        className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted"
                      >
                        Donations
                      </Link>
                      <Link
                        to="/gallery"
                        onClick={() => setMobileNavOpen(false)}
                        className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted"
                      >
                        Gallery
                      </Link>
                    </>
                  )}
                  {user ? (
                    <Link
                      to="/impact"
                      onClick={() => setMobileNavOpen(false)}
                      className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted"
                    >
                      Impact Dashboard
                    </Link>
                  ) : null}
                  {!user ? (
                    <Link
                      to="/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="mt-1 block rounded bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground no-underline"
                    >
                      Login
                    </Link>
                  ) : (
                    <div className="mt-2 border-t border-border pt-2">
                      <Link
                        to="/account-settings"
                        onClick={() => setMobileNavOpen(false)}
                        className="block rounded px-3 py-2 text-sm text-foreground no-underline hover:bg-muted"
                      >
                        Account settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileNavOpen(false);
                          navigate('/logout');
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <nav className="hidden items-center gap-8 font-body text-sm md:flex">
            {!isRegularUser ? (
              <>
                <a href="/#mission" className="text-muted-foreground transition-colors hover:text-foreground">
                  Mission
                </a>
                <a href="/#impact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Impact
                </a>
                <a href="/#how" className="text-muted-foreground transition-colors hover:text-foreground">
                  How It Works
                </a>
                <Link to="/gallery" className="text-muted-foreground transition-colors hover:text-foreground">
                  Gallery
                </Link>
                <a href="/#donate" className="text-muted-foreground transition-colors hover:text-foreground">
                  Donate
                </a>
              </>
            ) : null}
            {!user ? (
              <Link
                to="/login"
                className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] hover:opacity-95"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <div className="hidden items-center gap-5 sm:flex">
                  <Link
                    to="/donations"
                    className="text-sm font-semibold text-primary no-underline transition-colors hover:underline"
                  >
                    Donations
                  </Link>
                  <Link
                    to="/gallery"
                    className="text-sm font-semibold text-primary no-underline transition-colors hover:underline"
                  >
                    Gallery
                  </Link>
                  <Link
                    to="/impact"
                    className="text-sm font-semibold text-primary no-underline transition-colors hover:underline"
                  >
                    Impact Dashboard
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="leading-tight text-right">
                    <div className="text-sm font-semibold text-foreground">
                      {displayName || user.userName?.trim() || user.email.split('@')[0] || user.email}
                    </div>
                    <div
                      className="max-w-[220px] truncate text-xs text-muted-foreground"
                      title={user.email}
                    >
                      {user.email}
                    </div>
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
                          src={resolveProfileImageSrc(profileImageDataUrl)}
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
                          to="/account-settings"
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
                            navigate('/logout');
                          }}
                          className="block w-full rounded px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                          Log out
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
