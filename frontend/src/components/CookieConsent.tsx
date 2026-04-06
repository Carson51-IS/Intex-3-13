import { Link } from 'react-router-dom';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function CookieConsent() {
  const { hasConsented, acknowledgeConsent } = useCookieConsent();
  if (hasConsented) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#2d3748',
      color: 'white',
      padding: '1.25rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '700px', lineHeight: 1.5 }}>
        We use essential cookies for security and sign-in functionality. See our{' '}
        <Link to="/cookies" style={{ color: '#90cdf4', textDecoration: 'underline' }}>Cookie Policy</Link>{' '}
        and <Link to="/privacy" style={{ color: '#90cdf4', textDecoration: 'underline' }}>Privacy Policy</Link>.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={acknowledgeConsent}
          style={{
            padding: '0.5rem 1.25rem',
            border: 'none',
            backgroundColor: '#4299e1',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
