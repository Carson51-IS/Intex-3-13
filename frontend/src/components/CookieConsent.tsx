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
    <div className="fixed inset-x-0 bottom-0 z-[1000] flex flex-wrap items-center justify-between gap-4 bg-sidebar px-6 py-5 text-sidebar-foreground">
      <p className="m-0 max-w-3xl text-sm leading-relaxed">
        We use cookies to enhance your experience. By continuing to visit this site you agree to our
        use of cookies. See our <a href="/privacy" className="text-info underline underline-offset-2">Privacy Policy</a> for details.
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleDecline}
          className="rounded-md border border-sidebar-border px-5 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
