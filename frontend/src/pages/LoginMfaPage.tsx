import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export type LoginMfaLocationState = {
  email: string;
  password: string;
};

function isState(v: unknown): v is LoginMfaLocationState {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.email === 'string' && o.email.length > 0 && typeof o.password === 'string';
}

export default function LoginMfaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [fieldHint, setFieldHint] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state;
  const credentials = isState(state) ? state : null;

  useEffect(() => {
    if (!credentials) {
      navigate('/login', { replace: true });
    }
  }, [credentials, navigate]);

  if (!credentials) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8 text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  const { email, password } = credentials;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldHint('');
    setSubmitError('');
    const trimmedTotp = twoFactorCode.trim();
    const trimmedRecovery = recoveryCode.trim();
    if (!trimmedTotp && !trimmedRecovery) {
      setFieldHint('Please enter your authenticator code or a recovery code.');
      return;
    }
    setIsSubmitting(true);
    try {
      const session = await login(
        email,
        password,
        trimmedTotp || undefined,
        trimmedRecovery || undefined,
      );
      if (!session.isAuthenticated) {
        setSubmitError('Sign-in could not be completed. Please check your code and try again.');
        return;
      }
      const isAdmin = session.roles.includes('Admin');
      const isDonor = session.roles.includes('Donor');
      navigate(isAdmin ? '/admin' : isDonor ? '/donor' : '/', { replace: true });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Sign-in could not be completed. Please try again.',
      );
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
          <h1 className="font-heading text-2xl font-bold">Two-step sign-in</h1>
          <p className="mt-1 font-body text-sm text-primary-foreground/85">
            Additional verification for your account
          </p>
        </div>

        <div className="p-6">
          <div className="mb-5 rounded-md border border-border bg-muted/50 px-3 py-3 text-sm text-foreground">
            <p className="m-0 font-medium text-foreground">This account requires MFA.</p>
            <p className="mt-2 mb-0 text-muted-foreground">
              Please enter the code from your authenticator app, or a one-time recovery code, to finish
              signing in.
            </p>
          </div>

          <p className="mb-4 text-center text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{email}</span>
          </p>

          {fieldHint ? (
            <p className="mb-4 text-center text-sm text-muted-foreground" role="status">
              {fieldHint}
            </p>
          ) : null}

          {submitError ? (
            <div
              className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
              role="alert"
            >
              {submitError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="mb-4 rounded-md border border-border bg-muted/40 p-4">
              <div className="mb-3">
                <label htmlFor="mfa-twoFactorCode" className={labelCn}>
                  Authenticator code
                </label>
                <input
                  id="mfa-twoFactorCode"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  className={inputCn}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="mfa-recoveryCode" className={labelCn}>
                  Recovery code
                </label>
                <input
                  id="mfa-recoveryCode"
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="One-time recovery code"
                  className={inputCn}
                />
                <p className="mt-2 mb-0 text-xs text-muted-foreground">
                  Use a recovery code only if you can&apos;t access your authenticator app.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-body text-base font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Verifying…' : 'Verify and sign in'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              replace
              className="text-sm font-semibold text-primary no-underline hover:underline"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
