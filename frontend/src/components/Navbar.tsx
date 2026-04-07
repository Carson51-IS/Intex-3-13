import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isDonor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: '60px',
      backgroundColor: '#1a365d',
      color: 'white',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.3rem' }}>🏠</span> Haven Light Philippines
      </Link>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <Link to="/impact" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.9rem' }}>Impact</Link>
        <Link to="/privacy" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</Link>

        {user ? (
          <>
            {isDonor && !isAdmin && (
              <Link to="/donor" style={{ color: '#90cdf4', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                My Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" style={{ color: '#90cdf4', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                Admin Portal
              </Link>
            )}
            <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #4a5568',
                color: '#e2e8f0',
                padding: '0.3rem 0.7rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              color: '#1a365d',
              backgroundColor: '#e2e8f0',
              padding: '0.35rem 0.85rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
