import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
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

      <div
        style={{
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <NavLink to="/impact">Impact</NavLink>
        <NavLink to="/insights">Insights</NavLink>
        <NavLink to="/privacy">Privacy</NavLink>
        <NavLink to="/cookies">Cookies</NavLink>
        {isAuthenticated ? <NavLink to="/manage-mfa">MFA</NavLink> : null}

        {isLoading ? (
          <span style={{ color: '#cbd5e0', fontSize: '0.85rem' }}>Loading…</span>
        ) : user ? (
          <>
            {isDonor && !isAdmin && (
              <Link to="/donor" className="text-sm font-medium text-primary hover:underline">
                My Dashboard
              </Link>
            )}
            {isAdmin && (
              <>
                <span style={{ color: '#a0aec0', fontSize: '0.8rem' }} aria-hidden>
                  |
                </span>
                <NavLink to="/admin">Dashboard</NavLink>
                <NavLink to="/admin/users">Users</NavLink>
                <NavLink to="/admin/donor-insights">Donors</NavLink>
                <NavLink to="/admin/resident-insights">Residents</NavLink>
              </>
            )}
            <span className="ml-1 text-xs text-muted-foreground">{user.username}</span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              style={{
                background: 'transparent',
                border: '1px solid #e2e8f0',
                color: '#e2e8f0',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              style={{
                color: '#e2e8f0',
                border: '1px solid #e2e8f0',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Register
            </Link>
            <Link
              to="/login"
              style={{
                color: '#1a365d',
                backgroundColor: '#e2e8f0',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'background-color 0.2s',
              }}
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
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}
