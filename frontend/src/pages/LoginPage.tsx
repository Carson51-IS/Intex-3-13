import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExternalLoginUrl, getExternalProviders, loginUser, type ExternalProvider } from '../lib/AuthAPI';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorRecoveryCode, setTwoFactorRecoveryCode] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [externalProviders, setExternalProviders] = useState<ExternalProvider[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshAuthSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getExternalProviders()
      .then((providers) => setExternalProviders(providers))
      .catch(() => setExternalProviders([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('error');
    if (message) setError(message);
  }, [location.search]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginUser(
        email,
        password,
        rememberMe,
        twoFactorCode || undefined,
        twoFactorRecoveryCode || undefined,
      );

      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setError('Enter your authenticator code or a recovery code to continue.');
        return;
      }

      await refreshAuthSession();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalLogin = (provider: string) => {
    window.location.href = getExternalLoginUrl(provider, '/');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
      }}>
        <h1 style={{ fontSize: '1.5rem', textAlign: 'center', color: '#1a365d', marginBottom: '1.5rem' }}>
          Staff Login
        </h1>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fed7d7',
            color: '#c53030',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!requiresTwoFactor && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>
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
                <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>
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

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" style={{ color: '#4a5568', fontSize: '0.9rem' }}>
                  Remember Me
                </label>
              </div>
            </>
          )}

          {requiresTwoFactor && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="twoFactorCode" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>
                  Authenticator Code
                </label>
                <input
                  id="twoFactorCode"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  autoComplete="one-time-code"
                  placeholder="123456"
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
                <label htmlFor="twoFactorRecoveryCode" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>
                  Recovery Code
                </label>
                <input
                  id="twoFactorRecoveryCode"
                  type="text"
                  value={twoFactorRecoveryCode}
                  onChange={(e) => setTwoFactorRecoveryCode(e.target.value)}
                  placeholder="xxxx-xxxx"
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
                <small style={{ color: '#718096' }}>
                  Use a recovery code only if you cannot access your authenticator app.
                </small>
              </div>
            </>
          )}

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
            {isSubmitting ? 'Signing in...' : requiresTwoFactor ? 'Verify and Sign In' : 'Sign In'}
          </button>

          {requiresTwoFactor && (
            <button
              type="button"
              onClick={() => {
                setRequiresTwoFactor(false);
                setTwoFactorCode('');
                setTwoFactorRecoveryCode('');
                setError('');
              }}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.65rem',
                backgroundColor: 'transparent',
                color: '#2b6cb0',
                border: '1px solid #2b6cb0',
                borderRadius: '4px',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Back to Email and Password
            </button>
          )}

          <p style={{ marginTop: '1rem', textAlign: 'center', color: '#4a5568', fontSize: '0.9rem' }}>
            Need an account? <Link to="/register">Register</Link>
          </p>

          {externalProviders.length > 0 && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              {externalProviders.map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={() => handleExternalLogin(provider.name)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#fff',
                    color: '#2d3748',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Continue with {provider.displayName}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
