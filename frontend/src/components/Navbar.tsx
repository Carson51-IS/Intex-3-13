import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { authSession, isAuthenticated, isAdmin } = useAuth();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#1a365d',
      color: 'white',
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 'bold' }}>
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

        {isAuthenticated ? (
          <>
            <NavLink to="/mfa" style={{ color: '#e2e8f0', textDecoration: 'none' }}>MFA</NavLink>
            {isAdmin && (
              <NavLink to="/admin" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Admin</NavLink>
            )}
            <NavLink to="/logout" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Logout</NavLink>
          </>
        ) : (
          <NavLink
            to="/login"
            style={{
              color: '#1a365d',
              backgroundColor: '#e2e8f0',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}
