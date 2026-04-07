import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../lib/AuthAPI';

export default function LogoutPage() {
  const { logout, refreshAuthSession } = useAuth();
  const [message, setMessage] = useState('Signing you out...');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function runLogout() {
      try {
        await logoutUser();
        await refreshAuthSession();
        if (isMounted) {
          logout();
          setMessage('Signed out successfully');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to sign out');
          setMessage('Signed out locally (server request failed).');
          logout();
        }
      }
    }

    void runLogout();
    return () => {
      isMounted = false;
    };
  }, [logout, refreshAuthSession]);

  const isSigningOut = message === 'Signing you out...';
  const isSignedOut = message === 'Signed out successfully' && !error;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            textAlign: 'center',
            color: '#1a365d',
            marginBottom: '1.5rem',
          }}
        >
          Staff Sign Out
        </h1>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fed7d7',
              color: '#c53030',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {isSignedOut && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#c6f6d5',
              color: '#276749',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            Signed out successfully
          </div>
        )}

        {isSigningOut && (
          <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#4a5568' }}>
            Signing you out...
          </p>
        )}

        <p
          style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#4a5568',
          }}
        >
          <Link to="/" style={{ color: '#2b6cb0', fontWeight: 600 }}>
            Return home
          </Link>
          {' · '}
          <Link to="/login" style={{ color: '#2b6cb0', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
