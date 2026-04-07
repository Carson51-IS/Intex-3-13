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
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl border bg-card p-10 card-shadow">
        <h1 className="mb-6 text-center font-heading text-2xl font-semibold text-card-foreground">
          Staff Sign Out
        </h1>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {isSignedOut && (
          <div className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            Signed out successfully
          </div>
        )}

        {isSigningOut && (
          <p className="mb-6 text-sm text-muted-foreground">
            Signing you out...
          </p>
        )}

        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link to="/" className="font-semibold text-primary no-underline hover:underline">
            Return home
          </Link>
          {' · '}
          <Link to="/login" className="font-semibold text-primary no-underline hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
