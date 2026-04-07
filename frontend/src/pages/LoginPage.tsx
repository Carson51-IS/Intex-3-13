import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import heroBeach from '../assets/hero-beach.png';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [googleError, setGoogleError] = useState('');

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    setGoogleError('');
    if (!response.credential) {
      setGoogleError('Google sign-in did not return a credential.');
      return;
    }
    try {
      const me = await loginWithGoogle(response.credential);
      navigate(me.roles.includes('Admin') ? '/admin' : '/donor');
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-120px)] items-center justify-center overflow-hidden px-4 py-10">
      <img src={heroBeach} alt="Beach background" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-primary/55" />
      <div className="absolute inset-0 hero-gradient opacity-35" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/20 bg-card/95 card-shadow backdrop-blur-sm">
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <h1 className="font-heading text-2xl font-bold">{tab === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="mt-1 font-body text-sm text-primary-foreground/85">
            {tab === 'login' ? 'Sign in to continue to your dashboard.' : 'Join Haven Light and start supporting our mission.'}
          </p>
        </div>

        <div className="flex border-b border-border">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {googleClientId ? (
            <div className="mb-5 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setGoogleError('Google sign-in was cancelled or failed.')}
                text={tab === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular"
                width={360}
              />
            </div>
          ) : null}

          {googleError && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{googleError}</div>
          )}

          {googleClientId ? (
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="whitespace-nowrap text-xs text-muted-foreground">or use a username</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          ) : null}

          {tab === 'login' ? (
            <LoginForm login={login} navigate={navigate} />
          ) : (
            <RegisterForm />
          )}
        </div>

        <div className="border-t border-border px-6 pb-5 pt-4 text-center">
          <Link to="/impact" className="text-sm text-primary hover:underline">
            View our public impact dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ login, navigate }: {
  login: (identifier: string, password: string) => Promise<void>;
  navigate: (path: string) => void;
}) {
  const [identifier, setIdentifier] = useState('');
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
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
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

function RegisterForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { token } = await api.post<{ token: string }>('/auth/register', {
        username,
        password,
        email: email || undefined,
      });
      localStorage.setItem('token', token);
      navigate('/donor');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelStyle}>Username <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="pick a username"
            className={inputStyle}
          />
        </div>
        <div className="mb-4">
          <label className={labelStyle}>Email <span className="font-normal text-muted-foreground">(optional)</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputStyle}
          />
        </div>
        <div className="mb-4">
          <label className={labelStyle}>Password <span className="font-normal text-muted-foreground">(min 12 chars)</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className={inputStyle} />
        </div>
        <div className="mb-6">
          <label className={labelStyle}>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className={inputStyle} />
        </div>
        <button type="submit" disabled={isSubmitting} className={btnStyle(isSubmitting)}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </>
  );
}

const inputStyle =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelStyle = 'mb-1 block text-sm font-medium text-foreground';

const btnStyle = (disabled: boolean) =>
  `w-full rounded-md px-4 py-2.5 text-sm font-semibold transition ${
    disabled ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:opacity-95'
  }`;
