import confetti from 'canvas-confetti';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccountPreferences } from '../lib/accountPreferences';

function parseAmount(raw: string | null): number {
  if (raw == null || raw === '') return 1000;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 1) return 1000;
  return n;
}

const CONFETTI_COLORS = ['#1d4ed8', '#0ea5e9', '#f59e0b', '#22c55e', '#a855f7', '#ec4899'];

function burst(opts: Parameters<typeof confetti>[0]) {
  void confetti({
    ...opts,
    colors: opts?.colors ?? CONFETTI_COLORS,
    zIndex: 100,
    disableForReducedMotion: true,
  });
}

export default function DonateThankYouPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [currencyPreference, setCurrencyPreference] = useState<'PHP' | 'USD'>('PHP');
  const amount = useMemo(() => parseAmount(searchParams.get('amount')), [searchParams]);
  const formattedAmount = useMemo(
    () =>
      new Intl.NumberFormat(currencyPreference === 'USD' ? 'en-US' : 'en-PH', {
        style: 'currency',
        currency: currencyPreference,
      }).format(amount),
    [amount, currencyPreference],
  );

  useEffect(() => {
    if (!user) return;
    const fallbackName = user.userName?.trim() || user.email.split('@')[0] || user.email;
    const prefs = getAccountPreferences(user.email, fallbackName);
    setCurrencyPreference(prefs.currency);
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    burst({ particleCount: 130, spread: 82, origin: { y: 0.42 } });

    const t1 = window.setTimeout(() => {
      burst({ particleCount: 55, angle: 60, spread: 58, origin: { x: 0, y: 0.62 } });
      burst({ particleCount: 55, angle: 120, spread: 58, origin: { x: 1, y: 0.62 } });
    }, 350);

    const t2 = window.setTimeout(() => {
      burst({ particleCount: 90, spread: 88, origin: { y: 0.55 }, scalar: 0.95 });
    }, 750);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="overflow-hidden rounded-xl border bg-card card-shadow">
        <div className="hero-gradient px-8 py-10 text-center text-primary-foreground">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">Thank you for your generosity</h1>
          <p className="mt-3 text-lg text-primary-foreground/90">
            Your gift of <span className="font-semibold">{formattedAmount}</span> will make a real difference.
          </p>
        </div>
        <div className="space-y-5 px-8 py-8 text-foreground">
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <video
              className="h-auto w-full"
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
            >
              <source src="/ThankYouVideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Donations like yours help us keep our safe houses running around the clock: nutritious meals, trauma-informed
            counseling, school fees, medical care, and loving staff who walk alongside each girl on her healing journey.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Every peso strengthens our ability to welcome new referrals, maintain safe facilities, and plan for long-term
            reintegration with families and communities. You are part of that story.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Your support directly covers day-to-day care for girls in residence.</li>
            <li>It helps fund education and life-skills programs that open doors after graduation.</li>
            <li>It sustains the staff and systems that keep children safe and hopeful.</li>
          </ul>
          <p className="text-sm font-medium text-foreground">
            We are grateful you chose to stand with Haven Light Philippines. Thank you.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
