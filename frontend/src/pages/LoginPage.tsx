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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (user.roles.includes('Admin')) navigate('/admin');
    else navigate('/donor');
  }, [user, navigate]);

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

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="identifier" className={labelStyle}>Username or email</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            placeholder="your username or email"
            className={inputStyle}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className={labelStyle}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={inputStyle}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className={btnStyle(isSubmitting)}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </>
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
