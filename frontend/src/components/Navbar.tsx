import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin, isDonor } = useAuth();
  const isRegularUser = Boolean(user && !isAdmin && !isDonor);

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
              <div className="flex items-center gap-3">
                <Link
                  to="/manage-mfa"
                  className="hidden text-sm font-semibold text-primary no-underline transition-colors hover:underline sm:inline"
                >
                  MFA
                </Link>
                <div className="leading-tight text-right">
                  <div className="text-sm font-semibold text-foreground">
                    {user.userName?.trim() || user.email.split('@')[0] || user.email}
                  </div>
                  <div
                    className="max-w-[220px] truncate text-xs text-muted-foreground"
                    title={user.email}
                  >
                    {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/logout')}
                  className="shrink-0 rounded-md border border-primary/25 bg-background px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Log out
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
