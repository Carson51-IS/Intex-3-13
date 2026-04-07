import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.85rem 2rem',
      backgroundColor: '#1a365d',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Haven Light Philippines
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
            <span className="ml-1 text-xs text-muted-foreground">{user.email}</span>
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
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        color: '#e2e8f0',
        textDecoration: 'none',
        fontSize: '0.9rem',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'white')}
      onMouseLeave={e => (e.currentTarget.style.color = '#e2e8f0')}
    >
      {children}
    </Link>
  );
}
