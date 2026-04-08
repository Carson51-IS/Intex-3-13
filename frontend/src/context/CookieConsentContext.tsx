import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

const CookieConsentStorageKey = 'cookieConsent';
const CookieConsentValue = 'acknowledged';

interface CookieConsentContextValue {
    hasAcknowledgedConsent: boolean;
    acknowledgeConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

/** True only after the user clicks "I understand" (persisted). New visitors have no storage → banner shows. */
function readHasAcknowledgedConsent(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        const stored = window.localStorage.getItem(CookieConsentStorageKey);
        if (
            stored === CookieConsentValue ||
            stored === 'accepted' ||
            stored === 'declined'
        ) {
            return true;
        }
    } catch {
        /* private / blocked storage */
    }

    try {
        return document.cookie
            .split(';')
            .map((part) => part.trim())
            .some((part) => part === `${CookieConsentStorageKey}=${CookieConsentValue}`);
    } catch {
        return false;
    }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
    const [hasAcknowledgedConsent, setHasAcknowledgedConsent] = useState(() => readHasAcknowledgedConsent());

    const value = useMemo<CookieConsentContextValue>(
        () => ({
            hasAcknowledgedConsent,
            acknowledgeConsent() {
                try {
                    window.localStorage.setItem(CookieConsentStorageKey, CookieConsentValue);
                } catch {
                    /* still set cookie + in-memory state */
                }
                document.cookie = `${CookieConsentStorageKey}=${CookieConsentValue}; path=/; max-age=31536000; SameSite=Lax`;
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
