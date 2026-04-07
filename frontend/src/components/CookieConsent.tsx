import { useState } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cookieConsent') === null;
  });

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    document.cookie = 'cookieConsent=accepted; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    document.cookie = 'cookieConsent=declined; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  };

  if (!visible) return null;

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
        We use cookies to enhance your experience. By continuing to visit this site you agree to our
        use of cookies. See our <a href="/privacy" style={{ color: '#90cdf4', textDecoration: 'underline' }}>Privacy Policy</a> for details.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleDecline}
          style={{
            padding: '0.5rem 1.25rem',
            border: '1px solid #a0aec0',
            backgroundColor: 'transparent',
            color: '#a0aec0',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
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
          Accept
        </button>
      </div>
    </div>
  );
}
