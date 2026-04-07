import { Link } from 'react-router-dom';
import { useCookieConsent } from '../context/CookieConsentContext';

export function CookieConsentBanner() {
    const { hasAcknowledgedConsent, acknowledgeConsent } = useCookieConsent();

    if (hasAcknowledgedConsent) {
        return null;
    }

    return (
        <aside
            role="dialog"
            aria-live="polite"
            className="fixed inset-x-0 bottom-0 z-[1000] flex flex-wrap items-center justify-between gap-4 border-t border-sidebar-border bg-sidebar px-4 py-4 text-sidebar-foreground"
        >
            <div className="max-w-4xl">
                <p className="mb-1 text-sm font-semibold">Cookie notice</p>
                <p className="mb-1 text-sm text-sidebar-foreground/90">
                    This demo uses cookies for sign-in and security features. Google sign-in may also
                    set provider cookies during the external login flow.
                </p>
                <p className="m-0 text-sm text-sidebar-foreground/90">
                    We are not adding analytics or marketing cookies in this phase. Read the{' '}
                    <Link to="/cookies" className="text-info underline underline-offset-2">
                        cookie policy
                    </Link>{' '}
                    for more information.
                </p>
            </div>

            <button
                type="button"
                onClick={acknowledgeConsent}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
                I understand
            </button>
        </aside>
    );
}

export default CookieConsentBanner;
