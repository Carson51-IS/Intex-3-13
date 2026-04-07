import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

const CookieConsentStorageKey = 'cookieConsent';

interface CookieConsentContextValue {
    hasAcknowledgedConsent: boolean;
    acknowledgeConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

function readInitialConsentValue() {
    if (typeof window === 'undefined') {
        return false;
    }

    const stored = window.localStorage.getItem(CookieConsentStorageKey);
    return stored === 'acknowledged' || stored === 'accepted' || stored === 'declined';
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
    const [hasAcknowledgedConsent, setHasAcknowledgedConsent] = useState(readInitialConsentValue);

    const value = useMemo<CookieConsentContextValue>(
        () => ({
            hasAcknowledgedConsent,
            acknowledgeConsent() {
                window.localStorage.setItem(CookieConsentStorageKey, 'acknowledged');
                document.cookie = 'cookieConsent=acknowledged; path=/; max-age=31536000; SameSite=Lax';
                setHasAcknowledgedConsent(true);
            },
        }),
        [hasAcknowledgedConsent]
    );

    return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
    const context = useContext(CookieConsentContext);
    if (!context) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider');
    }
    return context;
}
