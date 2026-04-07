import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { refreshAuthSession } = useAuth();
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const trimmedTwoFactorCode = twoFactorCode.trim();
      const trimmedRecoveryCode = recoveryCode.trim();
      const session = await login(
        email,
        password,
        trimmedTwoFactorCode || undefined,
        trimmedRecoveryCode || undefined,
      );
      await refreshAuthSession();
      if (!session.isAuthenticated) {
        setError('Sign in failed. Please check your credentials.');
        return;
      }
      const isAdmin = session.roles.includes('Admin');
      navigate(isAdmin ? '/admin' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '440px',
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
            marginBottom: '0.75rem',
          }}
        >
          Staff Login
        </h1>
        <p
          style={{
            marginTop: 0,
            marginBottom: '1.25rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#4a5568',
          }}
        >
          Sign in to continue to Haven Light.
        </p>

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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              marginBottom: '1rem',
              padding: '0.85rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: '#f7fafc',
            }}
          >
            <p
              style={{
                marginTop: 0,
                marginBottom: '0.5rem',
                fontSize: '0.8rem',
                color: '#4a5568',
                fontWeight: 600,
              }}
            >
              Optional MFA
            </p>
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                htmlFor="twoFactorCode"
                style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, color: '#4a5568' }}
              >
                Authentication Code
              </label>
              <input
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="6-digit code"
                autoComplete="one-time-code"
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ marginTop: '0.35rem', marginBottom: 0, fontSize: '0.78rem', color: '#718096' }}>
                Leave blank unless MFA is enabled on your account.
              </p>
            </div>

            <div>
              <label
                htmlFor="recoveryCode"
                style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, color: '#4a5568' }}
              >
                Recovery Code
              </label>
              <input
                id="recoveryCode"
                type="text"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="Recovery code"
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ marginTop: '0.35rem', marginBottom: 0, fontSize: '0.78rem', color: '#718096' }}>
                Use this instead of an authentication code if needed.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: isSubmitting ? '#a0aec0' : '#2b6cb0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{
            width: '100%',
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'white',
            color: '#2b6cb0',
            border: '1px solid #2b6cb0',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
