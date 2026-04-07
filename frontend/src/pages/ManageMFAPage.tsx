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
  const { authSession, isAuthenticated, isLoading } = useAuth();
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
      setError('Failed to load two-factor status');
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
      setError('Failed to enable two-factor authentication');
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
      setError('Failed to disable two-factor authentication');
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
      setError('Failed to reset recovery codes');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

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
          maxWidth: '560px',
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
            marginBottom: '1rem',
          }}
        >
          Manage MFA
        </h1>
        <p
          style={{
            marginBottom: '1.25rem',
            color: '#4a5568',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}
        >
          Secure your account with an authenticator app and recovery codes.
        </p>

        {!isLoading && !isAuthenticated ? (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#ebf8ff',
              color: '#2a4365',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            Sign in first, then return to <Link to="/manage-mfa">Manage MFA</Link>.
          </div>
        ) : (
          <>
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

            {successMessage && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#c6f6d5',
                  color: '#276749',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {successMessage}
              </div>
            )}

            <div
              style={{
                marginBottom: '1rem',
                color: '#4a5568',
                fontSize: '0.95rem',
              }}
            >
              {twoFactorStatus?.isTwoFactorEnabled
                ? `Two-factor authentication is enabled. ${twoFactorStatus.recoveryCodesLeft} recovery codes left.`
                : 'Two-factor authentication is disabled. Scan the QR code below and enter the one-time code from your authenticator app.'}
            </div>

            {!twoFactorStatus?.isTwoFactorEnabled && (
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f7fafc',
                }}
              >
                <p style={{ marginTop: 0, marginBottom: '0.75rem', color: '#2d3748', fontWeight: 600 }}>
                  Authenticator setup
                </p>
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="MFA QR code"
                    style={{
                      display: 'block',
                      width: '224px',
                      height: '224px',
                      margin: '0 auto 0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                    }}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#718096' }}>
                    QR code unavailable. You can still enter the setup key manually.
                  </p>
                )}
                <p style={{ marginBottom: 0, fontSize: '0.8rem', color: '#718096', wordBreak: 'break-all' }}>
                  Setup key: <code>{twoFactorStatus?.sharedKey ?? 'Unavailable'}</code>
                </p>
              </div>
            )}

            <form onSubmit={handleEnable} style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="authenticationCode"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: '#4a5568',
                }}
              >
                Authentication Code
              </label>
              <input
                id="authenticationCode"
                type="text"
                value={authenticationCode}
                onChange={(e) => setAuthenticationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required={!twoFactorStatus?.isTwoFactorEnabled}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  marginBottom: '0.75rem',
                }}
              />
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
                {isSubmitting ? 'Enabling...' : 'Enable MFA'}
              </button>
            </form>

            <form onSubmit={handleDisable} style={{ marginBottom: '0.75rem' }}>
              <button
                type="submit"
                disabled={isSubmitting || !twoFactorStatus?.isTwoFactorEnabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#c53030',
                  border: '1px solid #feb2b2',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isSubmitting || !twoFactorStatus?.isTwoFactorEnabled ? 'not-allowed' : 'pointer',
                  opacity: !twoFactorStatus?.isTwoFactorEnabled ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Disabling...' : 'Disable MFA'}
              </button>
            </form>

            <form onSubmit={handleResetRecoveryCodes}>
              <button
                type="submit"
                disabled={isSubmitting || !twoFactorStatus?.isTwoFactorEnabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#2b6cb0',
                  border: '1px solid #90cdf4',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isSubmitting || !twoFactorStatus?.isTwoFactorEnabled ? 'not-allowed' : 'pointer',
                  opacity: !twoFactorStatus?.isTwoFactorEnabled ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Recovery Codes'}
              </button>
            </form>

            {recoveryCodes.length > 0 && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: '#f7fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#2d3748' }}>Recovery Codes</h3>
                <p style={{ marginTop: 0, color: '#718096', fontSize: '0.8rem' }}>
                  Save these codes somewhere safe. Each code can be used once.
                </p>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '1.2rem',
                    color: '#2d3748',
                  }}
                >
                  {recoveryCodes.map((code) => (
                    <li key={code} style={{ marginBottom: '0.25rem' }}>
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

