import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
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
      padding: '1rem 2rem',
      backgroundColor: '#1a365d',
      color: 'white',
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Haven Light Philippines
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/impact" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Impact</Link>
        <Link to="/privacy" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Privacy</Link>

        {user ? (
          <>
            {isAdmin && (
              <Link to="/admin" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Admin</Link>
            )}
            <span style={{ color: '#cbd5e0', fontSize: '0.875rem' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #e2e8f0',
                color: '#e2e8f0',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
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
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
