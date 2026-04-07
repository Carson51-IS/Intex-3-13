import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-primary/15 bg-white/85 px-4 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src={havenLightLogoMark} alt="Haven Light logo" className="h-9 w-9 object-contain" />
          <span className="font-heading text-lg font-semibold text-primary md:text-xl">Haven Light Philippines</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <a href="/#mission" className="text-sm font-medium text-foreground/80 no-underline transition-colors hover:text-primary">Mission</a>
          <a href="/#impact" className="text-sm font-medium text-foreground/80 no-underline transition-colors hover:text-primary">Impact</a>
          <a href="/#how" className="text-sm font-medium text-foreground/80 no-underline transition-colors hover:text-primary">How It Works</a>
          <a href="/#donate" className="text-sm font-medium text-foreground/80 no-underline transition-colors hover:text-primary">Donate</a>

          {isAuthenticated ? <NavLink to="/manage-mfa">MFA</NavLink> : null}

          {isLoading ? (
            <span className="text-sm text-muted-foreground">Loading…</span>
          ) : user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">{user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="rounded-md border border-primary/25 bg-white px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-md border border-primary/25 px-3 py-1.5 text-sm font-semibold text-primary no-underline transition-colors hover:bg-primary/5"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground no-underline transition-opacity hover:opacity-90"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-foreground/80 no-underline transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}
