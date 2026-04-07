import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login } = useAuth();
  const navigate = useNavigate();

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
              {t === 'login' ? 'Sign In' : 'Create Donor Account'}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
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
  login: (email: string, password: string) => Promise<void>;
  navigate: (path: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation happens after login resolves — user state is set synchronously in AuthContext
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Once user is set, navigate based on role
  if (user) {
    if (user.roles.includes('Admin')) {
      navigate('/admin');
    } else {
      navigate('/donor');
    }
  }

  return (
    <>
      <h1 style={{ fontSize: '1.4rem', textAlign: 'center', color: '#1a365d', marginBottom: '1.5rem', fontWeight: 700 }}>
        Welcome Back
      </h1>

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
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, color: '#4a5568', fontSize: '0.9rem' }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, color: '#4a5568', fontSize: '0.9rem' }}>
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      await api.post('/auth/register', { email, password, role: 'Donor' });
      // Log in immediately after registration
      const result = await api.post<{ token: string }>('/auth/login', { email, password });
      localStorage.setItem('token', result.token);
      navigate('/donor');
      window.location.reload(); // refresh auth state to load user from /auth/me
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: '1.4rem', textAlign: 'center', color: '#1a365d', marginBottom: '0.5rem', fontWeight: 700 }}>
        Create Donor Account
      </h1>
      <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Join us and track your contributions
      </p>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" style={inputStyle} />
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
