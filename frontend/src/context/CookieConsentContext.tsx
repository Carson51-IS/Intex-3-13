import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type CookieConsentValue = {
  hasConsented: boolean;
  acknowledgeConsent: () => void;
};

const CookieConsentContext = createContext<CookieConsentValue | null>(null);
const STORAGE_KEY = 'cookieConsent';

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setHasConsented(stored === 'accepted');
  }, []);

  const acknowledgeConsent = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    document.cookie = 'cookieConsent=accepted; path=/; max-age=31536000; SameSite=Lax';
    setHasConsented(true);
  };

  const value = useMemo(() => ({
    hasConsented,
    acknowledgeConsent,
  }), [hasConsented]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return ctx;
}
