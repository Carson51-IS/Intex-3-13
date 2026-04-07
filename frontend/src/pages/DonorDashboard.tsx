import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Donation {
  donationId: number;
  donationType: string;
  donationDate: string;
  amount: number | null;
  currencyCode: string | null;
  campaignName: string | null;
  channelSource: string;
  isRecurring: boolean;
  notes: string | null;
}

interface Supporter {
  supporterId: number;
  displayName: string;
  email: string;
  supporterType: string;
  firstDonationDate: string | null;
}

interface MyHistoryResponse {
  supporter: Supporter | null;
  donations: Donation[];
}

interface PublicImpact {
  activeResidents: number;
  totalSafehouses: number;
  totalSupporters: number;
}

const CAMPAIGNS = [
  'General Fund',
  'Education Support',
  'Health & Wellness',
  'Emergency Relief',
  'Safehouse Operations',
  'Reintegration Program',
];

export default function DonorDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState<MyHistoryResponse | null>(null);
  const [impact, setImpact] = useState<PublicImpact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await api.get<MyHistoryResponse>('/donations/my-history');
      setHistory(data);
    } catch {
      setHistory({ supporter: null, donations: [] });
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchHistory(),
        api.get<PublicImpact>('/dashboard/public-impact').then(setImpact).catch(() => {}),
      ]);
      setIsLoading(false);
    };
    init();
  }, []);

  const totalDonated = history?.donations.reduce((sum, d) => sum + (d.amount ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Welcome
          {history?.supporter
            ? `, ${history.supporter.displayName}`
            : user
              ? `, ${user.userName?.trim() || user.email.split('@')[0] || user.email}`
              : ''}
          !
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for supporting Haven Light Philippines. Your generosity makes a real difference.
        </p>
      </div>

      {impact && (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <ImpactCard label="Girls in Our Care" value={impact.activeResidents.toString()} accent="text-info" />
          <ImpactCard label="Active Safehouses" value={impact.totalSafehouses.toString()} accent="text-success" />
          <ImpactCard label="Total Supporters" value={impact.totalSupporters.toString()} accent="text-primary" />
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 card-shadow">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            My Total Contributions
          </div>
          <div className="text-4xl font-bold text-success">
            ₱{totalDonated.toLocaleString()}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Across {history?.donations.length ?? 0} donation{(history?.donations.length ?? 0) !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-5 card-shadow">
          <p className="m-0 text-center text-sm text-muted-foreground">
            Ready to make another contribution?
          </p>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={
              showForm
                ? 'rounded-md border border-border bg-muted px-6 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80'
                : 'rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
            }
          >
            {showForm ? 'Cancel' : '+ Donate Now'}
          </button>
        </div>
      </div>

      {showForm && (
        <DonationForm
          onSuccess={() => {
            setShowForm(false);
            fetchHistory();
          }}
        />
      )}

      <div className="overflow-hidden rounded-xl border bg-card card-shadow">
        <div className="border-b px-6 py-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground">Donation History</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : !history?.donations.length ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-xl font-semibold text-foreground">No donations yet</div>
            <div className="text-sm text-muted-foreground">
              Make your first donation to support the girls in our care.
            </div>
          </div>
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
                  <td className="px-4 py-3 text-foreground">{new Date(d.donationDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-4 py-3 font-semibold text-success">
                    {d.amount != null ? `${d.currencyCode ?? '₱'} ${d.amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.campaignName ?? 'General Fund'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.channelSource}</td>
                  <td className="px-4 py-3">
                    {d.isRecurring && (
                      <span className="rounded-full bg-info/15 px-2 py-1 text-xs font-semibold text-info">
                        Recurring
                      </span>
                    )}
                    {!d.isRecurring && <span className="text-xs text-muted-foreground">One-time</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link to="/impact" className="text-sm font-medium text-primary no-underline hover:underline">
          View our full impact dashboard →
        </Link>
      </div>
    </div>
  );
}

function DonationForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    amount: '',
    currencyCode: 'PHP',
    campaignName: 'General Fund',
    isRecurring: false,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid donation amount greater than zero.');
      return;
    }
    if (amount < 50) {
      setError('Minimum donation amount is ₱50.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.post<{ message: string }>('/donations/submit', {
        amount,
        currencyCode: form.currencyCode,
        campaignName: form.campaignName || null,
        isRecurring: form.isRecurring,
        notes: form.notes || null,
      });
      setSuccess(result.message);
      setTimeout(() => {
        setSuccess('');
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Donation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mb-8 rounded-xl border border-success/30 bg-success/10 p-8 text-center">
        <div className="text-lg font-semibold text-success">{success}</div>
        <div className="mt-1 text-sm text-muted-foreground">Your contribution will make a real difference.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-card p-6 card-shadow">
      <h3 className="mb-5 font-heading text-xl font-semibold text-card-foreground">
        Make a Donation
      </h3>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelCn}>Donation Amount (₱)*</label>
          <div className="flex items-center gap-1">
            <span className="rounded-l-md border border-border bg-muted px-2 py-2 text-sm text-muted-foreground">₱</span>
            <input
              type="number"
              min={50}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              required
              placeholder="0.00"
              className={`${inputCn} rounded-l-none`}
            />
          </div>
          <div className="mt-2 flex gap-2">
            {[500, 1000, 2500, 5000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setForm(f => ({ ...f, amount: amt.toString() }))}
                className={`rounded border px-2 py-1 text-xs transition-colors ${
                  form.amount === amt.toString()
                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                ₱{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCn}>Campaign</label>
          <select
            value={form.campaignName}
            onChange={(e) => setForm(f => ({ ...f, campaignName: e.target.value }))}
            className={inputCn}
          >
            {CAMPAIGNS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCn}>Message (Optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          placeholder="Add a personal message of support…"
          className={`${inputCn} resize-y`}
        />
      </div>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={form.isRecurring}
            onChange={(e) => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
          />
          Make this a monthly recurring donation
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-success px-6 py-2 text-sm font-semibold text-success-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Processing…' : `Donate ₱${parseFloat(form.amount || '0').toLocaleString() || '0'}`}
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        This is a demonstration platform. No real payment will be processed.
      </p>
    </form>
  );
}

function ImpactCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-center card-shadow">
      <div className={`text-4xl font-bold ${accent}`}>{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

const labelCn = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const inputCn =
  'w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2';
