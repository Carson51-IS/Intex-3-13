import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../lib/AuthAPI';

export default function LogoutPage() {
  const { refreshAuthSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logoutUser()
      .then(async () => {
        await refreshAuthSession();
      })
      .catch(() => {
        // If logout request fails, still refresh to sync frontend session state.
        return refreshAuthSession();
      })
      .finally(() => {
        navigate('/login', { replace: true });
      });
  }, [refreshAuthSession, navigate]);

  return <div style={{ padding: '2rem', textAlign: 'center' }}>Signing out...</div>;
}
