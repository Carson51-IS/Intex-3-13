import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'donationPromptDismissed';

function scrollToDonate() {
  const el = document.getElementById('donate');
  if (!el) return;
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

const SHOW_DELAY_MS = 2000;

export default function DonationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        return;
      }
    } catch {
      /* ignore */
    }

    const id = window.setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  const goDonate = useCallback(() => {
    scrollToDonate();
  }, []);

  if (!visible) return null;

  return (
    <aside
      role="complementary"
      aria-label="Donation prompt"
      className="fixed bottom-10 right-10 z-40 w-[min(100vw-5rem,20rem)] rounded-xl border border-border bg-card p-4 card-shadow animate-in fade-in slide-in-from-bottom-2 duration-300 sm:bottom-12 sm:right-12"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-base font-semibold text-foreground">Change a life today</h3>
        <button
          type="button"
          onClick={dismiss}
          className="-m-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss donation prompt"
        >
          <span aria-hidden className="block text-lg leading-none">
            ×
          </span>
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Your gift helps provide shelter, care, and education for girls in our safe homes.
      </p>
      <button
        type="button"
        onClick={goDonate}
        className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        Donate now
      </button>
    </aside>
  );
}
