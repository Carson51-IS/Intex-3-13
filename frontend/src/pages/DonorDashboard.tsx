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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#1a365d', fontWeight: 700, marginBottom: '0.3rem' }}>
          Welcome{history?.supporter ? `, ${history.supporter.displayName}` : user ? `, ${user.username}` : ''}! 👋
        </h1>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Thank you for supporting Haven Light Philippines. Your generosity makes a real difference.
        </p>
      </div>

      {/* Impact Stats */}
      {impact && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <ImpactCard label="Girls in Our Care" value={impact.activeResidents.toString()} icon="👧" color="#2b6cb0" />
          <ImpactCard label="Active Safehouses" value={impact.totalSafehouses.toString()} icon="🏠" color="#38a169" />
          <ImpactCard label="Total Supporters" value={impact.totalSupporters.toString()} icon="💝" color="#805ad5" />
        </div>
      )}

      {/* My Contribution Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            My Total Contributions
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38a169' }}>
            ₱{totalDonated.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
            Across {history?.donations.length ?? 0} donation{(history?.donations.length ?? 0) !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
          <p style={{ color: '#4a5568', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
            Ready to make another contribution?
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: showForm ? '#718096' : '#2b6cb0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {showForm ? 'Cancel' : '+ Donate Now'}
          </button>
        </div>
      </div>

      {/* Donation Form */}
      {showForm && (
        <DonationForm
          onSuccess={() => {
            setShowForm(false);
            fetchHistory();
          }}
        />
      )}

      {/* Donation History */}
      <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#2d3748' }}>Donation History</h2>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>Loading…</div>
        ) : !history?.donations.length ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💝</div>
            <div style={{ color: '#4a5568', fontWeight: 600, marginBottom: '0.5rem' }}>No donations yet</div>
            <div style={{ color: '#a0aec0', fontSize: '0.875rem' }}>
              Make your first donation to support the girls in our care.
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Date', 'Amount', 'Campaign', 'Channel', 'Type'].map((h) => (
                  <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 700, color: '#718096', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.donations.map((d, i) => (
                <tr key={d.donationId} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={tdStyle}>{new Date(d.donationDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#38a169' }}>
                    {d.amount != null ? `${d.currencyCode ?? '₱'} ${d.amount.toLocaleString()}` : '—'}
                  </td>
                  <td style={tdStyle}>{d.campaignName ?? 'General Fund'}</td>
                  <td style={tdStyle}>{d.channelSource}</td>
                  <td style={tdStyle}>
                    {d.isRecurring && (
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: '#ebf8ff', color: '#2b6cb0', fontWeight: 600 }}>
                        Recurring
                      </span>
                    )}
                    {!d.isRecurring && <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>One-time</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View impact link */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/impact" style={{ color: '#4299e1', textDecoration: 'none', fontSize: '0.9rem' }}>
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
      <div style={{ backgroundColor: '#f0fff4', borderRadius: '10px', padding: '2rem', border: '1px solid #9ae6b4', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
        <div style={{ fontWeight: 700, color: '#276749', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
          {success}
        </div>
        <div style={{ color: '#48bb78', fontSize: '0.875rem' }}>Your contribution will make a real difference.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#ebf8ff', borderRadius: '10px', padding: '1.5rem', border: '1px solid #bee3f8', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a365d', marginBottom: '1.25rem' }}>
        Make a Donation
      </h3>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #fed7d7' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Amount */}
        <div>
          <label style={labelStyle}>Donation Amount (₱)*</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ padding: '0.55rem 0.5rem', backgroundColor: '#e2e8f0', borderRadius: '6px 0 0 6px', border: '1px solid #e2e8f0', color: '#4a5568', fontSize: '0.9rem' }}>₱</span>
            <input
              type="number"
              min={50}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              required
              placeholder="0.00"
              style={{ ...inputStyle, borderRadius: '0 6px 6px 0', flex: 1 }}
            />
          </div>
          {/* Quick amount buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            {[500, 1000, 2500, 5000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setForm(f => ({ ...f, amount: amt.toString() }))}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  border: `1px solid ${form.amount === amt.toString() ? '#2b6cb0' : '#cbd5e0'}`,
                  borderRadius: '4px',
                  backgroundColor: form.amount === amt.toString() ? '#ebf8ff' : 'white',
                  color: form.amount === amt.toString() ? '#2b6cb0' : '#4a5568',
                  cursor: 'pointer',
                  fontWeight: form.amount === amt.toString() ? 700 : 400,
                }}
              >
                ₱{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign */}
        <div>
          <label style={labelStyle}>Campaign</label>
          <select value={form.campaignName} onChange={(e) => setForm(f => ({ ...f, campaignName: e.target.value }))} style={selectStyle}>
            {CAMPAIGNS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Message (Optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          placeholder="Add a personal message of support…"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#4a5568' }}>
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
          style={{
            padding: '0.7rem 2rem',
            backgroundColor: submitting ? '#a0aec0' : '#38a169',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          {submitting ? 'Processing…' : `Donate ₱${parseFloat(form.amount || '0').toLocaleString() || '0'}`}
        </button>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.75rem', textAlign: 'center' }}>
        This is a demonstration platform. No real payment will be processed.
      </p>
    </form>
  );
}

function ImpactCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.35rem' }}>{label}</div>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '0.7rem 1rem',
  color: '#4a5568',
  verticalAlign: 'middle',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#4a5568',
  marginBottom: '0.3rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.7rem',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  backgroundColor: 'white',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};
