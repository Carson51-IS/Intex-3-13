import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

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
      await loginWithGoogle(response.credential);
      navigate('/donor');
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '2rem',
      backgroundColor: '#f7fafc',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        backgroundColor: 'white',
        overflow: 'hidden',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: tab === t ? '#2b6cb0' : '#a0aec0',
                borderBottom: tab === t ? '2px solid #2b6cb0' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.15s',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Google Sign-In (shared across both tabs) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setGoogleError('Google sign-in was cancelled or failed.')}
              text={tab === 'login' ? 'signin_with' : 'signup_with'}
              shape="rectangular"
              width={360}
            />
          </div>

          {googleError && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fff5f5',
              color: '#c53030',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              border: '1px solid #fed7d7',
            }}>
              {googleError}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ color: '#a0aec0', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>or use a username</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {tab === 'login' ? (
            <LoginForm login={login} navigate={navigate} />
          ) : (
            <RegisterForm navigate={navigate} />
          )}
        </div>

        <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <Link to="/impact" style={{ color: '#4299e1', fontSize: '0.85rem', textDecoration: 'none' }}>
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
  const { user } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    if (user.roles.includes('Admin')) {
      navigate('/admin');
    } else {
      navigate('/donor');
    }
  }

  return (
    <>
      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fff5f5',
          color: '#c53030',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          border: '1px solid #fed7d7',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="identifier" style={labelStyle}>
            Username or email
          </label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            placeholder="your username or email"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={labelStyle}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={isSubmitting} style={btnStyle(isSubmitting)}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </>
  );
}

function RegisterForm({ navigate }: { navigate: (path: string) => void }) {
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
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fff5f5',
          color: '#c53030',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          border: '1px solid #fed7d7',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Username <span style={{ color: '#c53030' }}>*</span></label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="pick a username"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email <span style={{ color: '#a0aec0', fontWeight: 400 }}>(optional)</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Password <span style={{ color: '#a0aec0', fontWeight: 400 }}>(min 12 chars)</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" style={inputStyle} />
        </div>
        <button type="submit" disabled={isSubmitting} style={btnStyle(isSubmitting)}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.3rem',
  fontWeight: 500,
  color: '#4a5568',
  fontSize: '0.875rem',
};

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '0.75rem',
  backgroundColor: disabled ? '#a0aec0' : '#2b6cb0',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background 0.15s',
});
