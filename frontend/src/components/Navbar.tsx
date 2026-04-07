import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';

export default function Navbar() {
  const { user, logout, isAdmin, isDonor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-1">
          <img src={havenLightLogoMark} alt="Haven Light logo mark" className="h-10 w-auto" />
          <div className="leading-tight">
            <div className="font-heading text-lg font-semibold text-foreground">Haven Light</div>
            <div className="font-body text-xs tracking-[0.18em] text-muted-foreground">PHILIPPINES</div>
          </div>
        </Link>

        <div className="flex items-center gap-6">
        <NavLink to="/impact">Impact</NavLink>
        <NavLink to="/insights">Insights</NavLink>

        {user ? (
          <>
            {isDonor && !isAdmin && (
              <Link to="/donor" className="text-sm font-medium text-primary hover:underline">
                My Dashboard
              </Link>
            )}
            {isAdmin && (
              <>
                <span className="text-muted-foreground">|</span>
                <NavLink to="/admin">Dashboard</NavLink>
                <NavLink to="/admin/donor-insights">Donors</NavLink>
                <NavLink to="/admin/resident-insights">Residents</NavLink>
              </>
            )}
            <span className="ml-1 text-xs text-muted-foreground">{user.username}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] hover:opacity-95"
          >
            Login
          </Link>
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
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}
