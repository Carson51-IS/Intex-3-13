import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getApiBase } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

interface Resident {
  residentId: number;
  caseControlNo: string;
  internalCode: string;
  caseStatus: string;
  caseCategory: string;
  currentRiskLevel: string;
  assignedSocialWorker: string;
  safehouseId: number;
  dateOfAdmission: string;
  presentAge: string | null;
  safehouse?: { name: string };
}

interface Safehouse {
  safehouseId: number;
  name: string;
}

const STATUS_OPTIONS = ['Active', 'Closed', 'Transferred', 'Discharged'];
const RISK_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
const CATEGORY_OPTIONS = [
  'Abused Child', 'Neglected Child', 'Abandoned Child',
  'Child in Conflict with the Law', 'Trafficked', 'Exploited', 'At-Risk',
];

const riskColor: Record<string, string> = {
  Critical: '#c53030',
  High: '#dd6b20',
  Medium: '#d69e2e',
  Low: '#38a169',
};

const statusColor: Record<string, string> = {
  Active: '#2b6cb0',
  Closed: '#718096',
  Transferred: '#805ad5',
  Discharged: '#38a169',
};

export default function ResidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastBatchSize, setLastBatchSize] = useState(0);
  const [error, setError] = useState('');
  const residentsFetchId = useRef(0);

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const statusFilter = searchParams.get('status') ?? '';
  const riskFilter = searchParams.get('riskLevel') ?? '';
  const categoryFilter = searchParams.get('category') ?? '';
  const safehouseFilter = searchParams.get('safehouseId') ?? '';
  const caseNoFilter = searchParams.get('caseNo') ?? '';

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollThresholdPx = 240;

  const filtersKey = useMemo(() => JSON.stringify({
    status: statusFilter,
    riskLevel: riskFilter,
    category: categoryFilter,
    safehouseId: safehouseFilter,
    caseNo: caseNoFilter.trim(),
  }), [statusFilter, riskFilter, categoryFilter, safehouseFilter, caseNoFilter]);

  const hasMore = totalCount > 0 ? residents.length < totalCount : lastBatchSize === pageSize;

  const fetchResidents = useCallback(async () => {
    const fetchId = ++residentsFetchId.current;
    setIsLoading(page === 1);
    setIsLoadingMore(page !== 1);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
      if (statusFilter) params.set('status', statusFilter);
      if (riskFilter) params.set('riskLevel', riskFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (safehouseFilter) params.set('safehouseId', safehouseFilter);
      const trimmedCaseNo = caseNoFilter.trim();
      if (trimmedCaseNo) params.set('caseNo', trimmedCaseNo);

      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const response = await fetch(`${base}/residents?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (fetchId !== residentsFetchId.current) return;
      const total = response.headers.get('X-Total-Count');
      setTotalCount(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      if (fetchId !== residentsFetchId.current) return;
      const nextPage = raw ? (JSON.parse(raw) as Resident[]) : [];
      setLastBatchSize(nextPage.length);
      setResidents((prev) => {
        if (page === 1) return nextPage;
        if (nextPage.length === 0) return prev;
        const seen = new Set(prev.map((p) => p.residentId));
        const merged = prev.slice();
        for (const r of nextPage) {
          if (!seen.has(r.residentId)) merged.push(r);
        }
        return merged;
      });
    } catch (err) {
      if (fetchId !== residentsFetchId.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load residents');
    } finally {
      if (fetchId === residentsFetchId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [page, statusFilter, riskFilter, categoryFilter, safehouseFilter, caseNoFilter]);

  useEffect(() => {
    fetchResidents();
    api.get<Safehouse[]>('/safehouses').then(setSafehouses).catch(() => {});
  }, [fetchResidents]);

  useEffect(() => {
    setResidents([]);
    setTotalCount(0);
    setLastBatchSize(0);
    setPage(1);
  }, [filtersKey]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isLoading || isLoadingMore) return;
    if (!hasMore) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining <= scrollThresholdPx) setPage((p) => p + 1);
  }, [isLoading, isLoadingMore, hasMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isLoading || isLoadingMore) return;
    if (!hasMore) return;
    if (el.scrollHeight <= el.clientHeight + 2) setPage((p) => p + 1);
  }, [isLoading, isLoadingMore, hasMore, residents.length]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Caseload Inventory</h1>
            <p className="mt-1 text-sm text-muted-foreground">{totalCount} total records</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/residents/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              + Add Resident
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4 shadow-[var(--card-shadow)]">
          <div className="min-w-[min(100%,16rem)] flex-1">
            <label className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Search by case no.
            </label>
            <input
              type="search"
              value={caseNoFilter}
              onChange={(e) => setFilter('caseNo', e.target.value)}
              placeholder="Case control number…"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="off"
            />
          </div>
          <FilterSelect
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(v) => setFilter('status', v)}
          />
          <FilterSelect
            label="Risk Level"
            value={riskFilter}
            options={RISK_OPTIONS}
            onChange={(v) => setFilter('riskLevel', v)}
          />
          <FilterSelect
            label="Category"
            value={categoryFilter}
            options={CATEGORY_OPTIONS}
            onChange={(v) => setFilter('category', v)}
          />
          <FilterSelect
            label="Safehouse"
            value={safehouseFilter}
            options={safehouses.map(s => ({ value: s.safehouseId.toString(), label: s.name }))}
            onChange={(v) => setFilter('safehouseId', v)}
          />
          {(statusFilter || riskFilter || categoryFilter || safehouseFilter || caseNoFilter.trim()) && (
            <button
              onClick={() => setSearchParams(new URLSearchParams({ page: '1' }))}
              className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Table */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[65vh] overflow-auto rounded-lg border border-border bg-card shadow-[var(--card-shadow)]"
        >
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 bg-muted/40">
                {['Case No.', 'Code', 'Status', 'Risk Level', 'Category', 'Social Worker', 'Admitted', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    No residents found matching the current filters.
                  </td>
                </tr>
              ) : (
                residents.map((r, i) => (
                  <tr
                    key={r.residentId}
                    className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
                  >
                    <td className={tdCn}>{r.caseControlNo || '—'}</td>
                    <td className={`${tdCn} font-mono font-semibold text-primary`}>{r.internalCode}</td>
                    <td className={tdCn}>
                      <Badge text={r.caseStatus} color={statusColor[r.caseStatus] ?? '#718096'} />
                    </td>
                    <td className={tdCn}>
                      <Badge text={r.currentRiskLevel} color={riskColor[r.currentRiskLevel] ?? '#718096'} />
                    </td>
                    <td className={`${tdCn} max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap`}>
                      {r.caseCategory || '—'}
                    </td>
                    <td className={`${tdCn} max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap`}>
                      {r.assignedSocialWorker || '—'}
                    </td>
                    <td className={tdCn}>{r.dateOfAdmission ? new Date(r.dateOfAdmission).toLocaleDateString() : '—'}</td>
                    <td className={tdCn}>
                      <Link
                        to={`/admin/residents/${r.residentId}`}
                        className="text-xs font-semibold text-primary no-underline hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
              {isLoadingMore && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-xs text-muted-foreground">
                    Loading more…
                  </td>
                </tr>
              )}
              {!isLoading && !isLoadingMore && !hasMore && residents.length > 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-xs text-muted-foreground">
                    End of results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[] | { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer rounded-md border border-border px-2 py-1.5 text-sm transition-colors ${value ? 'bg-primary/5 font-medium text-primary' : 'bg-background text-foreground'}`}
      >
        <option value="">All</option>
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
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

const tdCn = 'px-4 py-3 align-middle text-foreground/85';
