import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  resetRecoveryCodes,
} from '../lib/authClient';
import type { TwoFactorStatus } from '../types/TwoFactorStatus';

export default function ManageMFAPage() {
  const { authSession, isAuthenticated, isLoading, isAdmin, isDonor } = useAuth();
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const authenticatorUri = useMemo(() => {
    if (!authSession?.email || !twoFactorStatus?.sharedKey) return '';
    const issuer = 'Haven Light Philippines';
    const label = `${issuer}:${authSession.email}`;
    const searchParams = new URLSearchParams({
      secret: twoFactorStatus.sharedKey,
      issuer,
    });
    return `otpauth://totp/${encodeURIComponent(label)}?${searchParams.toString()}`;
  }, [authSession?.email, twoFactorStatus?.sharedKey]);

  async function loadTwoFactorStatus() {
    setError('');
    try {
      const status = await getTwoFactorStatus();
      setTwoFactorStatus(status);
      setRecoveryCodes(status.recoveryCodes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load two-factor status');
      console.error(e);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadTwoFactorStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authenticatorUri) {
      setQrCodeDataUrl('');
      return;
    }

    void QRCode.toDataURL(authenticatorUri, { width: 224, margin: 1 })
      .then(setQrCodeDataUrl)
      .catch(() => setQrCodeDataUrl(''));
  }, [authenticatorUri]);

  async function handleEnable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const status = await enableTwoFactor(authenticationCode);
      setTwoFactorStatus(status);
      setRecoveryCodes(status.recoveryCodes ?? []);
      setAuthenticationCode('');
      setSuccessMessage(
        `Two-factor authentication enabled. ${status.recoveryCodesLeft} recovery codes left.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enable two-factor authentication');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDisable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const status = await disableTwoFactor();
      setTwoFactorStatus(status);
      setRecoveryCodes(status.recoveryCodes ?? []);
      setSuccessMessage('Two-factor authentication disabled.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable two-factor authentication');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetRecoveryCodes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const status = await resetRecoveryCodes();
      setTwoFactorStatus(status);
      setRecoveryCodes(status.recoveryCodes ?? []);
      setSuccessMessage('Recovery codes reset.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset recovery codes');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-xl border bg-card p-10 card-shadow">
        {(isAdmin || isDonor) && (
          <p className="mb-3 text-center">
            <Link
              to={isAdmin ? '/admin/settings' : '/donor'}
              className="text-sm font-semibold text-primary no-underline hover:underline"
            >
              {isAdmin ? '← Back to Settings' : '← Back to donor dashboard'}
            </Link>
          </p>
        )}
        <h1 className="mb-4 text-center font-heading text-2xl font-semibold text-card-foreground">
          Manage MFA
        </h1>
        <p className="mb-5 text-center text-sm text-muted-foreground">
          Secure your account with an authenticator app and recovery codes.
        </p>

        {!isLoading && !isAuthenticated ? (
          <div className="rounded-md border border-info/30 bg-info/10 px-3 py-2 text-sm text-foreground">
            Sign in first, then return to <Link to="/manage-mfa">Manage MFA</Link>.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {successMessage}
              </div>
            )}

            <div className="mb-4 text-sm text-muted-foreground">
              {twoFactorStatus?.isTwoFactorEnabled
                ? `Two-factor authentication is enabled. ${twoFactorStatus.recoveryCodesLeft} recovery codes left.`
                : 'Two-factor authentication is disabled. Scan the QR code below and enter the one-time code from your authenticator app.'}
            </div>

            {!twoFactorStatus?.isTwoFactorEnabled && (
              <div className="mb-5 rounded-lg border border-border bg-muted/30 p-4">
                <p className="mb-3 mt-0 font-semibold text-foreground">
                  Authenticator setup
                </p>
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="MFA QR code"
                    className="mx-auto mb-3 h-56 w-56 rounded-md border bg-white"
                  />
                ) : (
                  <p className="m-0 text-sm text-muted-foreground">
                    QR code unavailable. You can still enter the setup key manually.
                  </p>
                )}
                <p className="mb-0 break-all text-xs text-muted-foreground">
                  Setup key: <code>{twoFactorStatus?.sharedKey ?? 'Unavailable'}</code>
                </p>
              </div>
            )}

            <form onSubmit={handleEnable} className="mb-4">
              <label htmlFor="authenticationCode" className="mb-2 block text-sm font-medium text-foreground">
                Authentication Code
              </label>
              <input
                id="authenticationCode"
                type="text"
                value={authenticationCode}
                onChange={(e) => setAuthenticationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required={!twoFactorStatus?.isTwoFactorEnabled}
                className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Enabling...' : 'Enable MFA'}
              </button>
            </form>

            <form onSubmit={handleDisable} className="mb-3">
              <button
                type="submit"
                disabled={isSubmitting || !twoFactorStatus?.isTwoFactorEnabled}
                className="w-full rounded-md border border-destructive/40 bg-background px-4 py-2.5 text-sm font-semibold text-destructive transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Disabling...' : 'Disable MFA'}
              </button>
            </form>

            <form onSubmit={handleResetRecoveryCodes}>
              <button
                type="submit"
                disabled={isSubmitting || !twoFactorStatus?.isTwoFactorEnabled}
                className="w-full rounded-md border border-info/40 bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Recovery Codes'}
              </button>
            </form>

            {recoveryCodes.length > 0 && (
              <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="mb-2 mt-0 font-heading text-base font-semibold text-foreground">Recovery Codes</h3>
                <p className="mt-0 text-xs text-muted-foreground">
                  Save these codes somewhere safe. Each code can be used once.
                </p>
                <ul className="m-0 list-disc pl-5 text-foreground">
                  {recoveryCodes.map((code) => (
                    <li key={code} className="mb-1">
                      <code>{code}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

