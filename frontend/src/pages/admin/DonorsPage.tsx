import { useEffect, useState, useCallback } from 'react';
import { api, getApiBase } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

interface Supporter {
  supporterId: number;
  displayName: string;
  supporterType: string;
  relationshipType: string;
  email: string;
  phone: string;
  status: string;
  country: string;
  region: string;
  firstDonationDate: string | null;
  createdAt: string;
}

interface Donation {
  donationId: number;
  supporterId: number;
  donationType: string;
  donationDate: string;
  amount: number | null;
  currencyCode: string | null;
  campaignName: string | null;
  channelSource: string;
  isRecurring: boolean;
  supporter?: { displayName: string };
}

const SUPPORTER_TYPES = ['Individual Donor', 'Corporate', 'Foundation', 'Church', 'Government', 'Volunteer', 'Skills Contributor', 'In-Kind Donor'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Lapsed'];

const formLabelCn = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const formControlCn =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const formSelectCn = `${formControlCn} cursor-pointer`;

export default function DonorsPage() {
  const [activeSection, setActiveSection] = useState<'supporters' | 'donations'>('supporters');
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [supporterTotal, setSupporterTotal] = useState(0);
  const [donationTotal, setDonationTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 15;

  const fetchSupporters = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const response = await fetch(`${base}/supporters?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const total = response.headers.get('X-Total-Count');
      setSupporterTotal(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      setSupporters(raw ? JSON.parse(raw) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supporters');
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, statusFilter]);

  const fetchDonations = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const response = await fetch(`${base}/donations?page=${page}&pageSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const total = response.headers.get('X-Total-Count');
      setDonationTotal(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      setDonations(raw ? JSON.parse(raw) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (activeSection === 'supporters') fetchSupporters();
    else fetchDonations();
  }, [activeSection, fetchSupporters, fetchDonations]);

  const handleFilterChange = (key: 'type' | 'status', value: string) => {
    setError('');
    if (key === 'type') setTypeFilter(value);
    else setStatusFilter(value);
    setPage(1);
  };

  const totalPages = Math.ceil((activeSection === 'supporters' ? supporterTotal : donationTotal) / pageSize);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Donors & Contributions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage supporter profiles and track all contributions
            </p>
          </div>
          {activeSection === 'supporters' && (
            <button
              type="button"
              onClick={() => { setError(''); setEditingSupporter(null); setShowForm(!showForm); }}
              className={
                showForm
                  ? 'inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted'
                  : 'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90'
              }
            >
              {showForm ? 'Cancel' : '+ Add Supporter'}
            </button>
          )}
        </div>

        {/* Section Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border">
          {(['supporters', 'donations'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setError(''); setActiveSection(s); setPage(1); setShowForm(false); }}
              className={`mb-[-1px] border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeSection === s
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'supporters' ? `Supporters (${supporterTotal})` : `Donations (${donationTotal})`}
            </button>
          ))}
        </div>

        {showForm && (
          <SupporterForm
            key={editingSupporter?.supporterId ?? 'new'}
            initial={editingSupporter}
            onSuccess={() => { setError(''); setShowForm(false); setEditingSupporter(null); fetchSupporters(); }}
            onCancel={() => { setError(''); setShowForm(false); setEditingSupporter(null); }}
          />
        )}

        {error && (
          <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Supporters Section */}
        {activeSection === 'supporters' && (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4 shadow-[var(--card-shadow)]">
              <FilterSelect label="Type" value={typeFilter} options={SUPPORTER_TYPES} onChange={(v) => handleFilterChange('type', v)} />
              <FilterSelect label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => handleFilterChange('status', v)} />
              {(typeFilter || statusFilter) && (
                <button
                  onClick={() => { setError(''); setTypeFilter(''); setStatusFilter(''); setPage(1); }}
                  style={{ alignSelf: 'flex-end', padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f7fafc', cursor: 'pointer', fontSize: '0.8rem', color: '#718096' }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--card-shadow)]">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['Name', 'Type', 'Relationship', 'Email', 'Country', 'Status', 'First Donation', 'Actions'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>Loading…</td></tr>
                  ) : supporters.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>No supporters found.</td></tr>
                  ) : (
                    supporters.map((s, i) => (
                      <tr key={s.supporterId} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#2d3748' }}>{s.displayName}</td>
                        <td style={tdStyle}><Badge text={s.supporterType} color="#805ad5" /></td>
                        <td style={tdStyle}>{s.relationshipType}</td>
                        <td style={{ ...tdStyle, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</td>
                        <td style={tdStyle}>{s.country || '—'}</td>
                        <td style={tdStyle}>
                          <Badge text={s.status} color={s.status === 'Active' ? '#38a169' : '#718096'} />
                        </td>
                        <td style={tdStyle}>{s.firstDonationDate ? new Date(s.firstDonationDate).toLocaleDateString() : '—'}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => { setError(''); setEditingSupporter(s); setShowForm(true); window.scrollTo(0, 0); }}
                            style={{ color: '#2b6cb0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', padding: 0 }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Donations Section */}
        {activeSection === 'donations' && (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--card-shadow)]">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Date', 'Supporter', 'Type', 'Amount', 'Campaign', 'Channel', 'Recurring'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>Loading…</td></tr>
                ) : donations.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>No donations found.</td></tr>
                ) : (
                  donations.map((d, i) => (
                    <tr key={d.donationId} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={tdStyle}>{new Date(d.donationDate).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{d.supporter?.displayName ?? `Donor #${d.supporterId}`}</td>
                      <td style={tdStyle}><Badge text={d.donationType} color="#2b6cb0" /></td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#38a169' }}>
                        {d.amount != null ? `${d.currencyCode ?? '₱'} ${d.amount.toLocaleString()}` : 'In-Kind'}
                      </td>
                      <td style={tdStyle}>{d.campaignName ?? '—'}</td>
                      <td style={tdStyle}>{d.channelSource}</td>
                      <td style={tdStyle}>{d.isRecurring ? <Badge text="Recurring" color="#2b6cb0" /> : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <PaginationBtn label="← Prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
            <span style={{ fontSize: '0.875rem', color: '#4a5568', padding: '0 0.5rem' }}>
              Page {page} of {totalPages}
            </span>
            <PaginationBtn label="Next →" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

/** Payload for POST/PUT — matches backend `SupporterWriteDto` (camelCase JSON). */
function supporterWritePayloadFromForm(form: {
  displayName: string;
  supporterType: string;
  relationshipType: string;
  email: string;
  phone: string;
  status: string;
  country: string;
  region: string;
}) {
  const phone = form.phone.trim();
  return {
    displayName: form.displayName.trim(),
    supporterType: form.supporterType,
    relationshipType: form.relationshipType,
    email: form.email.trim(),
    phone: phone.length ? phone : null,
    status: form.status,
    country: form.country.trim() || null,
    region: form.region.trim() || null,
    firstName: null as string | null,
    lastName: null as string | null,
    organizationName: null as string | null,
  };
}

function SupporterForm({ initial, onSuccess, onCancel }: {
  initial: Supporter | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() => ({
    displayName: initial?.displayName ?? '',
    supporterType: initial?.supporterType ?? 'Individual Donor',
    relationshipType: initial?.relationshipType ?? 'Donor',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    status: initial?.status ?? 'Active',
    country: initial?.country ?? 'Philippines',
    region: initial?.region ?? '',
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.displayName.trim() || !form.email.trim()) {
      setError('Display name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const body = supporterWritePayloadFromForm(form);
      if (initial) {
        await api.put(`/supporters/${initial.supporterId}`, body);
      } else {
        await api.post('/supporters', body);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save supporter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-border bg-card p-6 shadow-[var(--card-shadow)]"
    >
      <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
        {initial ? 'Edit Supporter' : 'New Supporter'}
      </h3>
      {error && (
        <div className="mb-3 rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="mb-3 grid gap-3 md:grid-cols-3">
        <FormField label="Display Name*" value={form.displayName} onChange={(v) => setForm(f => ({ ...f, displayName: v }))} />
        <div>
          <label className={formLabelCn}>Type</label>
          <select value={form.supporterType} onChange={(e) => setForm(f => ({ ...f, supporterType: e.target.value }))} className={formSelectCn}>
            {SUPPORTER_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <FormField label="Email*" type="email" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} />
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <FormField label="Phone" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} />
        <FormField label="Country" value={form.country} onChange={(v) => setForm(f => ({ ...f, country: v }))} />
        <div>
          <label className={formLabelCn}>Status</label>
          <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={formSelectCn}>
            {STATUS_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving…' : (initial ? 'Update Supporter' : 'Create Supporter')}
        </button>
        <button
          type="button"
          onClick={() => { setError(''); onCancel(); }}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function FormField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className={formLabelCn}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={formControlCn} />
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex min-w-[8rem] flex-col gap-0.5">
      <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-md border border-border px-2 py-1.5 text-sm transition-colors ${value ? 'bg-primary/5 font-medium text-primary' : 'bg-background text-foreground'} cursor-pointer`}
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: `${color}18`, color }}>
      {text}
    </span>
  );
}

function PaginationBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontWeight: 700,
  color: 'hsl(var(--muted-foreground))',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: 'hsl(var(--foreground) / 0.85)',
  verticalAlign: 'middle',
};
