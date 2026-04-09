import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatAmountWithPreference, getAccountPreferences } from '../lib/accountPreferences';
import { useNavigate } from 'react-router-dom';
import type { DonateConfirmLocationState } from './DonateConfirmPage';

interface Donation {
  donationId: number;
  donationDate: string;
  amount: number | null;
  currencyCode: string | null;
  campaignName: string | null;
  channelSource: string;
  isRecurring: boolean;
}

interface Supporter {
  displayName: string;
  email: string;
}

interface MyHistoryResponse {
  supporter: Supporter | null;
  donations: Donation[];
}

const PRESET_AMOUNTS = [50, 100, 250, 500];
const CAMPAIGNS = [
  'General Fund',
  'Education Support',
  'Health & Wellness',
  'Emergency Relief',
  'Safehouse Operations',
  'Reintegration Program',
];

export default function DonationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<MyHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currencyPreference, setCurrencyPreference] = useState<'PHP' | 'USD'>('PHP');
  const [form, setForm] = useState({
    amount: '',
    campaignName: 'General Fund',
    isRecurring: false,
    notes: '',
  });

  const fetchHistory = async () => {
    try {
      const data = await api.get<MyHistoryResponse>('/donations/my-history');
      setHistory(data);
    } catch {
      setHistory({ supporter: null, donations: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fallbackName = user.userName?.trim() || user.email.split('@')[0] || user.email;
    const prefs = getAccountPreferences(user.email, fallbackName);
    setCurrencyPreference(prefs.currency);
  }, [user]);

  const totalDonated = history?.donations.reduce((sum, d) => sum + (d.amount ?? 0), 0) ?? 0;
  const currencyTag = currencyPreference === 'USD' ? '$' : '₱';
  const formatEnteredAmount = (rawAmount: string) => {
    const parsed = parseFloat(rawAmount || '0') || 0;
    return new Intl.NumberFormat(currencyPreference === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency: currencyPreference,
    }).format(parsed);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amount = parseFloat(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError('Please enter a valid donation amount greater than zero.');
      return;
    }
    const minAmount = currencyPreference === 'PHP' ? 50 : 1;
    if (amount < minAmount) {
      setError(
        currencyPreference === 'PHP'
          ? 'Minimum donation amount is ₱50.'
          : 'Minimum donation amount is $1.',
      );
      return;
    }
    const state: DonateConfirmLocationState = {
      amount,
      campaignName: form.campaignName,
      isRecurring: form.isRecurring,
      notes: form.notes.trim() || undefined,
    };
    navigate(`/donate/confirm?amount=${encodeURIComponent(amount.toString())}`, { state });
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Donations</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome
          {history?.supporter?.displayName
            ? `, ${history.supporter.displayName}`
            : user
              ? `, ${user.userName?.trim() || user.email.split('@')[0] || user.email}`
              : ''}{' '}
          — donate with a preset or custom amount and review your full donation history.
        </p>
      </div>

      <div className="mb-6 rounded-xl border bg-card p-5 card-shadow">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total donated</div>
        <div className="mt-1 text-4xl font-bold text-success">
          {formatAmountWithPreference(totalDonated, currencyPreference)}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {history?.donations.length ?? 0} donation{(history?.donations.length ?? 0) !== 1 ? 's' : ''} recorded
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-card p-6 card-shadow">
        <h2 className="mb-5 font-heading text-xl font-semibold text-card-foreground">Make a donation</h2>

        {error ? (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {success}
          </div>
        ) : null}

        <div className="mb-4">
          <label className={labelCn}>Amount ({currencyPreference})</label>
          <div className="flex items-center gap-1">
            <span className="rounded-l-md border border-border bg-muted px-2 py-2 text-sm text-muted-foreground">{currencyTag}</span>
            <input
              type="number"
              min={currencyPreference === 'PHP' ? 50 : 1}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
              placeholder="0.00"
              className={`${inputCn} rounded-l-none`}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setForm((f) => ({ ...f, amount: amt.toString() }))}
                className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                  form.amount === amt.toString()
                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {formatEnteredAmount(amt.toString())}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCn}>Campaign</label>
            <select
              value={form.campaignName}
              onChange={(e) => setForm((f) => ({ ...f, campaignName: e.target.value }))}
              className={inputCn}
            >
              {CAMPAIGNS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
              />
              Make this a monthly recurring donation
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className={labelCn}>Message (Optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Add a personal note..."
            className={`${inputCn} resize-y`}
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {`Donate ${formatEnteredAmount(form.amount)}`}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border bg-card card-shadow">
        <div className="border-b px-6 py-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground">Donation history</h2>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : !history?.donations.length ? (
          <div className="p-12 text-center text-muted-foreground">No donations yet.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 bg-muted/40">
                {['Date', 'Amount', 'Campaign', 'Channel', 'Type'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.donations.map((d, i) => (
                <tr key={d.donationId} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                  <td className="px-4 py-3 text-foreground">
                    {new Date(d.donationDate).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-success">
                    {d.amount != null ? formatAmountWithPreference(d.amount, currencyPreference) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.campaignName ?? 'General Fund'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.channelSource}</td>
                  <td className="px-4 py-3">
                    {d.isRecurring ? (
                      <span className="rounded-full bg-info/15 px-2 py-1 text-xs font-semibold text-info">
                        Recurring
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">One-time</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const labelCn = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const inputCn =
  'w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2';
