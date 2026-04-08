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
            aria-modal="false"
            aria-label="Cookie notice"
            aria-live="polite"
            className="fixed inset-x-0 bottom-0 z-[9999] flex flex-wrap items-center justify-between gap-4 border-t border-slate-600 bg-slate-900 px-4 py-4 text-slate-50 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] sm:px-6"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
            <div className="max-w-4xl">
                <p className="mb-1 text-sm font-semibold text-white">Cookie notice</p>
                <p className="mb-1 text-sm text-slate-200">
                    This demo uses cookies for sign-in and security features. Google sign-in may also
                    set provider cookies during the external login flow.
                </p>
                <p className="m-0 text-sm text-slate-200">
                    We are not adding analytics or marketing cookies in this phase. Read the{' '}
                    <Link to="/cookies" className="font-semibold text-sky-300 underline underline-offset-2 hover:text-sky-200">
                        cookie policy
                    </Link>{' '}
                    for more information.
                </p>
            </div>

            <button
                type="button"
                onClick={acknowledgeConsent}
                className="shrink-0 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-sky-500 hover:opacity-95"
            >
                I understand
            </button>
        </aside>
    );
}

export default CookieConsentBannerView;
