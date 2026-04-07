import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../lib/AuthAPI';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const meetsPasswordPolicy = (value: string) => value.length >= 14;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!meetsPasswordPolicy(password)) {
      setError('Password must be at least 14 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(email, password);
      setSuccessMessage('Registration successful! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <h1 className="font-heading text-2xl font-bold">User Registration</h1>
          <p className="mt-1 font-body text-sm text-primary-foreground/85">
            Create your account to continue.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-md border border-success/35 bg-success/10 px-3 py-2 text-sm text-success">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="register-email" className={labelCn}>Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCn}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Password must be at least 14 characters long.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="register-password" className={labelCn}>Password</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputCn}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="register-confirm-password" className={labelCn}>Confirm password</label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputCn}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-body text-base font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-3 flex w-full items-center justify-center rounded-md border border-primary bg-card px-4 py-2.5 font-body text-base font-semibold text-primary no-underline transition-colors hover:bg-primary/5"
          >
            Already have an account? Sign in
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
