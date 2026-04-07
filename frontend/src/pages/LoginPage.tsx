import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildExternalLoginUrl, getExternalAuthProviders } from '../lib/AuthAPI';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    getExternalAuthProviders()
      .then((providers) => {
        if (!cancelled) {
          setGoogleAvailable(providers.some((p) => p.name === 'Google'));
        }
      })
      .catch(() => {
        if (!cancelled) setGoogleAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get('error');
    if (q) setError(decodeURIComponent(q.replace(/\+/g, ' ')));
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    // #region agent log
    console.log('[DEBUG-37e360] handleSubmit start', { emailLen: email.trim().length });
    // #endregion
    try {
      const trimmedTwoFactorCode = twoFactorCode.trim();
      const trimmedRecoveryCode = recoveryCode.trim();
      const session = await login(
        email,
        password,
        trimmedTwoFactorCode || undefined,
        trimmedRecoveryCode || undefined,
      );
      // #region agent log
      console.log('[DEBUG-37e360] login returned session', { isAuthenticated: session.isAuthenticated, roles: session.roles, email: session.email, userName: session.userName });
      // #endregion
      if (!session.isAuthenticated) {
        setError('Sign in failed. Please check your credentials.');
        return;
      }
      const isAdmin = session.roles.includes('Admin');
      const isDonor = session.roles.includes('Donor');
      const target = isAdmin ? '/admin' : isDonor ? '/donor' : '/';
      // #region agent log
      console.log('[DEBUG-37e360] navigating to', target, { isAdmin, isDonor, roles: session.roles });
      // #endregion
      navigate(target);
    } catch (err) {
      // #region agent log
      console.log('[DEBUG-37e360] login error', { err: err instanceof Error ? err.message : String(err) });
      // #endregion
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCn =
    'w-full rounded-md border border-input bg-card px-3 py-2.5 font-body text-base text-foreground outline-none ring-ring focus:ring-2';
  const labelCn = 'mb-1.5 block font-body text-sm font-medium text-muted-foreground';

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/20 bg-card/95 card-shadow backdrop-blur-sm">
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <h1 className="font-heading text-2xl font-bold">Staff Login</h1>
          <p className="mt-1 font-body text-sm text-primary-foreground/85">Sign in to continue to Haven Light.</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {googleAvailable && (
            <>
              <button
                type="button"
                onClick={() => {
                  window.location.href = buildExternalLoginUrl('Google', '/');
                }}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 font-body text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.145-2.649-.417-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.081 44 34 44 24c0-1.341-.145-2.649-.417-3.917z"
                  />
                </svg>
                Continue with Google
              </button>
              <p className="mb-4 text-center font-body text-xs font-semibold text-muted-foreground">
                or sign in with email
              </p>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className={labelCn}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCn}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="password" className={labelCn}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputCn}
              />
            </div>

            <div className="mb-4 rounded-md border border-border bg-muted/50 p-4">
              <p className="mb-2 font-body text-xs font-semibold text-muted-foreground">Optional MFA</p>
              <div className="mb-3">
                <label htmlFor="twoFactorCode" className={labelCn}>Authentication Code</label>
                <input
                  id="twoFactorCode"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  className={inputCn}
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Leave blank unless MFA is enabled on your account.
                </p>
              </div>
              <div>
                <label htmlFor="recoveryCode" className={labelCn}>Recovery Code</label>
                <input
                  id="recoveryCode"
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Recovery code"
                  className={inputCn}
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Use this instead of an authentication code if needed.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-body text-base font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <Link
            to="/register"
            className="mt-3 flex w-full items-center justify-center rounded-md border border-primary bg-card px-4 py-2.5 font-body text-base font-semibold text-primary no-underline transition-colors hover:bg-primary/5"
          >
            Create an account
          </Link>

          <div className="mt-4 border-t border-border pt-4 text-center">
            <Link to="/impact" className="text-sm text-primary hover:underline">
              View our public impact dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
