import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { api, getApiBase } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { formatAmountWithPreference, getAccountPreferences } from '../../lib/accountPreferences';

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
  const { user } = useAuth();
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [supporterTotal, setSupporterTotal] = useState(0);
  const [donationTotal, setDonationTotal] = useState(0);
  const [supportersLastBatchSize, setSupportersLastBatchSize] = useState(0);
  const [donationsLastBatchSize, setDonationsLastBatchSize] = useState(0);
  const [supportersLoading, setSupportersLoading] = useState(true);
  const [supportersLoadingMore, setSupportersLoadingMore] = useState(false);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donationsLoadingMore, setDonationsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null);
  const [supporterPage, setSupporterPage] = useState(1);
  const [donationPage, setDonationPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [currencyPreference, setCurrencyPreference] = useState<'PHP' | 'USD'>('PHP');
  const pageSize = 15;
  const supportersFetchId = useRef(0);
  const donationsFetchId = useRef(0);
  const supportersScrollRef = useRef<HTMLDivElement | null>(null);
  const donationsScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollThresholdPx = 240;

  const supportersHasMore = supporterTotal > 0
    ? supporters.length < supporterTotal
    : supportersLastBatchSize === pageSize;
  const donationsHasMore = donationTotal > 0
    ? donations.length < donationTotal
    : donationsLastBatchSize === pageSize;

  const supportersQueryKey = useMemo(
    () => JSON.stringify({ typeFilter, statusFilter, nameSearch: nameSearch.trim() }),
    [typeFilter, statusFilter, nameSearch],
  );

  const fetchSupporters = useCallback(async () => {
    const fetchId = ++supportersFetchId.current;
    setError('');
    if (supporterPage === 1) setSupportersLoading(true);
    else setSupportersLoadingMore(true);
    try {
      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const params = new URLSearchParams({ page: supporterPage.toString(), pageSize: pageSize.toString() });
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const trimmedName = nameSearch.trim();
      if (trimmedName) params.set('supporterName', trimmedName);
      const response = await fetch(`${base}/supporters?${params.toString()}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (fetchId !== supportersFetchId.current) return;
      const total = response.headers.get('X-Total-Count');
      setSupporterTotal(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      if (fetchId !== supportersFetchId.current) return;
      const nextPage = (raw ? (JSON.parse(raw) as Supporter[]) : []);
      setSupportersLastBatchSize(nextPage.length);
      setSupporters((prev) => {
        if (supporterPage === 1) return nextPage;
        if (nextPage.length === 0) return prev;
        const seen = new Set(prev.map((p) => p.supporterId));
        const merged = prev.slice();
        for (const s of nextPage) {
          if (!seen.has(s.supporterId)) merged.push(s);
        }
        return merged;
      });
    } catch (err) {
      if (fetchId !== supportersFetchId.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load supporters');
    } finally {
      if (fetchId === supportersFetchId.current) {
        setSupportersLoading(false);
        setSupportersLoadingMore(false);
      }
    }
  }, [supporterPage, typeFilter, statusFilter, nameSearch]);

  const fetchDonations = useCallback(async () => {
    const fetchId = ++donationsFetchId.current;
    setError('');
    if (donationPage === 1) setDonationsLoading(true);
    else setDonationsLoadingMore(true);
    try {
      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const response = await fetch(`${base}/donations?page=${donationPage}&pageSize=${pageSize}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (fetchId !== donationsFetchId.current) return;
      const total = response.headers.get('X-Total-Count');
      setDonationTotal(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      if (fetchId !== donationsFetchId.current) return;
      const nextPage = (raw ? (JSON.parse(raw) as Donation[]) : []);
      setDonationsLastBatchSize(nextPage.length);
      setDonations((prev) => {
        if (donationPage === 1) return nextPage;
        if (nextPage.length === 0) return prev;
        const seen = new Set(prev.map((p) => p.donationId));
        const merged = prev.slice();
        for (const d of nextPage) {
          if (!seen.has(d.donationId)) merged.push(d);
        }
        return merged;
      });
    } catch (err) {
      if (fetchId !== donationsFetchId.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      if (fetchId === donationsFetchId.current) {
        setDonationsLoading(false);
        setDonationsLoadingMore(false);
      }
    }
  }, [donationPage]);

  useEffect(() => {
    void fetchSupporters();
  }, [fetchSupporters]);

  useEffect(() => {
    void fetchDonations();
  }, [fetchDonations]);

  useEffect(() => {
    setSupporters([]);
    setSupporterTotal(0);
    setSupportersLastBatchSize(0);
    setSupporterPage(1);
  }, [supportersQueryKey]);

  useEffect(() => {
    if (!user) return;
    const fallbackName = user.userName?.trim() || user.email.split('@')[0] || user.email;
    const prefs = getAccountPreferences(user.email, fallbackName);
    setCurrencyPreference(prefs.currency);
  }, [user]);

  const handleFilterChange = (key: 'type' | 'status', value: string) => {
    setError('');
    if (key === 'type') setTypeFilter(value);
    else setStatusFilter(value);
  };

  const handleNameSearchChange = (value: string) => {
    setError('');
    setNameSearch(value);
  };

  const handleSupportersScroll = useCallback(() => {
    const el = supportersScrollRef.current;
    if (!el) return;
    if (supportersLoading || supportersLoadingMore) return;
    if (!supportersHasMore) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining <= scrollThresholdPx) setSupporterPage((p) => p + 1);
  }, [supportersLoading, supportersLoadingMore, supportersHasMore]);

  const handleDonationsScroll = useCallback(() => {
    const el = donationsScrollRef.current;
    if (!el) return;
    if (donationsLoading || donationsLoadingMore) return;
    if (!donationsHasMore) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining <= scrollThresholdPx) setDonationPage((p) => p + 1);
  }, [donationsLoading, donationsLoadingMore, donationsHasMore]);

  // If the current page doesn't fill the container, keep loading until it does or we're out.
  useEffect(() => {
    const el = supportersScrollRef.current;
    if (!el) return;
    if (supportersLoading || supportersLoadingMore) return;
    if (!supportersHasMore) return;
    if (el.scrollHeight <= el.clientHeight + 2) setSupporterPage((p) => p + 1);
  }, [supportersLoading, supportersLoadingMore, supportersHasMore, supporters.length]);

  useEffect(() => {
    const el = donationsScrollRef.current;
    if (!el) return;
    if (donationsLoading || donationsLoadingMore) return;
    if (!donationsHasMore) return;
    if (el.scrollHeight <= el.clientHeight + 2) setDonationPage((p) => p + 1);
  }, [donationsLoading, donationsLoadingMore, donationsHasMore, donations.length]);

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

        <section className="mb-10">
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Supporters
            <span className="ml-2 text-sm font-normal text-muted-foreground">({supporterTotal})</span>
          </h2>
            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4 shadow-[var(--card-shadow)]">
              <div className="min-w-[min(100%,16rem)] flex-1">
                <label className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  Search by name
                </label>
                <input
                  type="search"
                  value={nameSearch}
                  onChange={(e) => handleNameSearchChange(e.target.value)}
                  placeholder="Name…"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="off"
                />
              </div>
              <FilterSelect label="Type" value={typeFilter} options={SUPPORTER_TYPES} onChange={(v) => handleFilterChange('type', v)} />
              <FilterSelect label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => handleFilterChange('status', v)} />
              {(typeFilter || statusFilter || nameSearch.trim()) && (
                <button
                  type="button"
                  onClick={() => { setError(''); setTypeFilter(''); setStatusFilter(''); setNameSearch(''); setSupporterPage(1); }}
                  className="self-end rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              ref={supportersScrollRef}
              onScroll={handleSupportersScroll}
              className="max-h-[65vh] overflow-auto rounded-lg border border-border bg-card shadow-[var(--card-shadow)]"
            >
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 bg-muted/40">
                    {['Name', 'Type', 'Relationship', 'Email', 'Country', 'Status', 'First Donation', 'Actions'].map(h => (
                      <th key={h} className={thCn}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {supportersLoading ? (
                    <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">Loading…</td></tr>
                  ) : supporters.length === 0 ? (
                    <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">No supporters found.</td></tr>
                  ) : (
                    supporters.map((s, i) => (
                      <tr key={s.supporterId} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                        <td className={`${tdCn} font-semibold text-foreground`}>{s.displayName}</td>
                        <td className={tdCn}><Badge text={s.supporterType} color="#805ad5" /></td>
                        <td className={tdCn}>{s.relationshipType}</td>
                        <td className={`${tdCn} max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap`}>{s.email}</td>
                        <td className={tdCn}>{s.country || '—'}</td>
                        <td className={tdCn}>
                          <Badge text={s.status} color={s.status === 'Active' ? '#38a169' : '#718096'} />
                        </td>
                        <td className={tdCn}>{s.firstDonationDate ? new Date(s.firstDonationDate).toLocaleDateString() : '—'}</td>
                        <td className={tdCn}>
                          <button
                            onClick={() => { setError(''); setEditingSupporter(s); setShowForm(true); window.scrollTo(0, 0); }}
                            className="p-0 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {supportersLoadingMore && (
                    <tr><td colSpan={8} className="p-4 text-center text-xs text-muted-foreground">Loading more…</td></tr>
                  )}
                  {!supportersLoading && !supportersLoadingMore && !supportersHasMore && supporters.length > 0 && (
                    <tr><td colSpan={8} className="p-4 text-center text-xs text-muted-foreground">End of results</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </section>

        <section>
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Donations
            <span className="ml-2 text-sm font-normal text-muted-foreground">({donationTotal})</span>
          </h2>
          <div
            ref={donationsScrollRef}
            onScroll={handleDonationsScroll}
            className="max-h-[65vh] overflow-auto rounded-lg border border-border bg-card shadow-[var(--card-shadow)]"
          >
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b-2 bg-muted/40">
                  {['Date', 'Supporter', 'Type', 'Amount', 'Campaign', 'Channel', 'Recurring'].map(h => (
                    <th key={h} className={thCn}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donationsLoading ? (
                  <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">Loading…</td></tr>
                ) : donations.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No donations found.</td></tr>
                ) : (
                  donations.map((d, i) => (
                    <tr key={d.donationId} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                      <td className={tdCn}>{new Date(d.donationDate).toLocaleDateString()}</td>
                      <td className={`${tdCn} font-semibold`}>{d.supporter?.displayName ?? `Donor #${d.supporterId}`}</td>
                      <td className={tdCn}><Badge text={d.donationType} color="#2b6cb0" /></td>
                      <td className={`${tdCn} font-bold text-success`}>
                        {d.amount != null ? formatAmountWithPreference(d.amount, currencyPreference) : 'In-Kind'}
                      </td>
                      <td className={tdCn}>{d.campaignName ?? '—'}</td>
                      <td className={tdCn}>{d.channelSource}</td>
                      <td className={tdCn}>{d.isRecurring ? <Badge text="Recurring" color="#2b6cb0" /> : '—'}</td>
                    </tr>
                  ))
                )}
                {donationsLoadingMore && (
                  <tr><td colSpan={7} className="p-4 text-center text-xs text-muted-foreground">Loading more…</td></tr>
                )}
                {!donationsLoading && !donationsLoadingMore && !donationsHasMore && donations.length > 0 && (
                  <tr><td colSpan={7} className="p-4 text-center text-xs text-muted-foreground">End of results</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
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
    <span style={{ backgroundColor: `${color}18`, color }} className="inline-block rounded-full px-2 py-1 text-xs font-semibold">
      {text}
    </span>
  );
}

const thCn = 'sticky top-0 z-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40';
const tdCn = 'px-4 py-3 align-middle text-foreground/85';
