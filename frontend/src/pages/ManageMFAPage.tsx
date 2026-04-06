import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  resetRecoveryCodes,
} from '../lib/AuthAPI';
import type { TwoFactorStatus } from '../types/twoFactorStatus';

const LABEL = 'HavenLight';

function buildOtpAuthUri(label: string, email: string, secret: string): string {
  const encodedLabel = encodeURIComponent(`${label}:${email}`);
  const encodedIssuer = encodeURIComponent(label);
  return `otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&digits=6`;
}

export default function ManageMFAPage() {
  const { authSession } = useAuth();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const otpauthUri = useMemo(() => {
    if (!authSession.email || !status?.sharedKey) return '';
    return buildOtpAuthUri(LABEL, authSession.email, status.sharedKey);
  }, [authSession.email, status?.sharedKey]);

  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getTwoFactorStatus();
        setStatus(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load MFA status.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, []);

  useEffect(() => {
    if (!otpauthUri) {
      setQrCodeDataUrl('');
      return;
    }

    QRCode.toDataURL(otpauthUri)
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => setQrCodeDataUrl(''));
  }, [otpauthUri]);

  const handleEnable = async () => {
    if (!verificationCode.trim()) {
      setError('Enter the 6-digit authenticator code first.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const result = await enableTwoFactor(verificationCode);
      setRecoveryCodes(result.recoveryCodes);
      const refreshed = await getTwoFactorStatus();
      setStatus(refreshed);
      setVerificationCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to enable MFA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await disableTwoFactor();
      setRecoveryCodes([]);
      const refreshed = await getTwoFactorStatus();
      setStatus(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to disable MFA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetRecoveryCodes = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const result = await resetRecoveryCodes();
      setRecoveryCodes(result.recoveryCodes);
      const refreshed = await getTwoFactorStatus();
      setStatus(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset recovery codes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading MFA settings...</div>;
  }

  return (
    <div style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ color: '#1a365d' }}>Manage MFA</h1>

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '4px', backgroundColor: '#fed7d7', color: '#c53030' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
        <p><strong>Status:</strong> {status?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
        <p><strong>Recovery codes left:</strong> {status?.recoveryCodesLeft ?? 0}</p>

        {status?.sharedKey && (
          <>
            <p><strong>Shared key:</strong> <code>{status.sharedKey}</code></p>
            {qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="MFA QR Code"
                style={{ width: '220px', height: '220px', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fff' }}
              />
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#2d3748' }}>Enable/Disable MFA</h2>
        {!status?.isTwoFactorEnabled && (
          <>
            <label htmlFor="verificationCode" style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568' }}>
              Verification code from authenticator app
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              style={{ width: '100%', maxWidth: '280px', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
            />
            <div style={{ marginTop: '0.75rem' }}>
              <button onClick={handleEnable} disabled={isSubmitting} style={{ padding: '0.5rem 0.8rem' }}>
                {isSubmitting ? 'Enabling...' : 'Enable MFA'}
              </button>
            </div>
          </>
        )}
        {status?.isTwoFactorEnabled && (
          <button onClick={handleDisable} disabled={isSubmitting} style={{ padding: '0.5rem 0.8rem' }}>
            {isSubmitting ? 'Updating...' : 'Disable MFA'}
          </button>
        )}
      </div>

      {status?.isTwoFactorEnabled && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#2d3748' }}>Recovery codes</h2>
          <button onClick={handleResetRecoveryCodes} disabled={isSubmitting} style={{ padding: '0.5rem 0.8rem', marginBottom: '0.75rem' }}>
            {isSubmitting ? 'Generating...' : 'Generate new recovery codes'}
          </button>
          {recoveryCodes.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {recoveryCodes.map((code) => (
                <li key={code}><code>{code}</code></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
