import { Link } from 'react-router-dom';
import { useCookieConsent } from '../context/CookieConsentContext';

export function CookieConsentBannerView() {
    const { hasAcknowledgedConsent, acknowledgeConsent } = useCookieConsent();

    if (hasAcknowledgedConsent) {
        return null;
    }

    return (
        <aside
            role="dialog"
            aria-live="polite"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                borderTop: '1px solid #374151',
                padding: '0.9rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
            }}
        >
            <div style={{ maxWidth: '900px' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.35rem' }}>Cookie notice</p>
                <p style={{ marginBottom: '0.35rem' }}>
                    This demo uses cookies for sign-in and security features. Google sign-in may also
                    set provider cookies during the external login flow.
                </p>
                <p style={{ margin: 0 }}>
                    We are not adding analytics or marketing cookies in this phase. Read the{' '}
                    <Link to="/cookies" style={{ color: '#93c5fd', textDecoration: 'underline' }}>
                        cookie policy
                    </Link>{' '}
                    for more information.
                </p>
            </div>

            <button
                type="button"
                onClick={acknowledgeConsent}
                style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 0.9rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                I understand
            </button>
        </aside>
    );
}

export default CookieConsentBannerView;
