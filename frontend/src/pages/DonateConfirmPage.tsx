import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getAccountPreferences } from '../lib/accountPreferences';

export interface DonateConfirmLocationState {
  amount?: number;
  campaignName?: string;
  isRecurring?: boolean;
  notes?: string;
}

function parseAmount(raw: string | null): number {
  if (raw == null || raw === '') return 1000;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 1) return 1000;
  return n;
}

export default function DonateConfirmPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currencyPreference, setCurrencyPreference] = useState<'PHP' | 'USD'>('PHP');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const state = location.state as DonateConfirmLocationState | null;

  const amount = useMemo(() => {
    const fromState = state?.amount;
    if (fromState != null && Number.isFinite(fromState) && fromState > 0) return fromState;
    return parseAmount(searchParams.get('amount'));
  }, [state, searchParams]);

  const campaignName = state?.campaignName?.trim() || 'General Fund';
  const isRecurring = state?.isRecurring ?? false;
  const notes = state?.notes?.trim() || null;

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

  const confirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      await api.post<{ message: string }>('/donations/submit', {
        amount,
        currencyCode: currencyPreference,
        campaignName: campaignName || null,
        isRecurring,
        notes,
        displayName: user?.userName?.trim() || undefined,
      });
      navigate(`/donate/thank-you?amount=${encodeURIComponent(amount.toString())}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record your donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-12">
      <div className="rounded-xl border bg-card p-8 card-shadow">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Confirm your donation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user?.email}</span>
        </p>
        {error ? (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <p className="mt-6 text-foreground">
          You are about to donate{' '}
          <span className="font-heading text-2xl font-bold text-primary">{formattedAmount}</span> to Haven
          Light Philippines. This gift helps fund safe housing, meals, therapy, and education for girls in our care.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Please confirm to complete this step. You will see a thank-you message with more about your impact next.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to={{ pathname: '/', hash: 'donate' }}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Change amount
          </Link>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Processing…' : 'Confirm donation'}
          </button>
        </div>
      </div>
    </div>
  );
}
