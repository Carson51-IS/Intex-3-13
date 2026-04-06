import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { authSession, isAuthenticated, isAdmin } = useAuth();

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

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <NavLink to="/impact" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Impact</NavLink>
        <NavLink to="/privacy" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Privacy</NavLink>
        {!isAuthenticated && <NavLink to="/register" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Register</NavLink>}

        <span
          className={`badge ${isAuthenticated ? 'bg-success' : 'bg-warning text-dark'}`}
          style={{ fontSize: '0.8rem' }}
        >
          {isAuthenticated ? `Signed in as ${authSession.email}` : 'Not signed in'}
        </span>
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <NavLink to="/impact">Impact</NavLink>
        <NavLink to="/insights">Insights</NavLink>
        <NavLink to="/privacy">Privacy</NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/mfa" style={{ color: '#e2e8f0', textDecoration: 'none' }}>MFA</NavLink>
            {isAdmin && (
              <NavLink to="/admin" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Admin</NavLink>
            )}
            <NavLink to="/logout" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Logout</NavLink>
              <>
                <span style={{ color: '#4a5568', fontSize: '0.8rem' }}>|</span>
                <NavLink to="/admin">Dashboard</NavLink>
                <NavLink to="/admin/donor-insights">Donors</NavLink>
                <NavLink to="/admin/resident-insights">Residents</NavLink>
              </>
            )}
            <span style={{ color: '#cbd5e0', fontSize: '0.8rem', marginLeft: '0.25rem' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #e2e8f0',
                color: '#e2e8f0',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink
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
          </NavLink>
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
