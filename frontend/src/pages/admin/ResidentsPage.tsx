import { useEffect, useState, useCallback } from 'react';
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
  const [error, setError] = useState('');

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = 20;
  const statusFilter = searchParams.get('status') ?? '';
  const riskFilter = searchParams.get('riskLevel') ?? '';
  const categoryFilter = searchParams.get('category') ?? '';
  const safehouseFilter = searchParams.get('safehouseId') ?? '';

  const fetchResidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
      if (statusFilter) params.set('status', statusFilter);
      if (riskFilter) params.set('riskLevel', riskFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (safehouseFilter) params.set('safehouseId', safehouseFilter);

      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const response = await fetch(`${base}/residents?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const total = response.headers.get('X-Total-Count');
      setTotalCount(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      setResidents(raw ? JSON.parse(raw) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load residents');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, riskFilter, categoryFilter, safehouseFilter]);

  useEffect(() => {
    fetchResidents();
    api.get<Safehouse[]>('/safehouses').then(setSafehouses).catch(() => {});
  }, [fetchResidents]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Caseload Inventory</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalCount} total records
            </p>
          </div>
          <Link
            to="/admin/residents/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            + Add Resident
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3 rounded-xl border bg-card p-4 card-shadow">
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
          {(statusFilter || riskFilter || categoryFilter || safehouseFilter) && (
            <button
              onClick={() => setSearchParams(new URLSearchParams({ page: '1' }))}
              style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f7fafc', cursor: 'pointer', fontSize: '0.8rem', color: '#718096' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-card card-shadow">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Case No.', 'Code', 'Status', 'Risk Level', 'Category', 'Social Worker', 'Admitted', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#4a5568', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>
                    Loading…
                  </td>
                </tr>
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>
                    No residents found matching the current filters.
                  </td>
                </tr>
              ) : (
                residents.map((r, i) => (
                  <tr
                    key={r.residentId}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: i % 2 === 0 ? 'white' : '#fafafa',
                    }}
                  >
                    <td style={tdStyle}>{r.caseControlNo || '—'}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#2b6cb0', fontWeight: 600 }}>{r.internalCode}</td>
                    <td style={tdStyle}>
                      <Badge text={r.caseStatus} color={statusColor[r.caseStatus] ?? '#718096'} />
                    </td>
                    <td style={tdStyle}>
                      <Badge text={r.currentRiskLevel} color={riskColor[r.currentRiskLevel] ?? '#718096'} />
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.caseCategory || '—'}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.assignedSocialWorker || '—'}
                    </td>
                    <td style={tdStyle}>{r.dateOfAdmission ? new Date(r.dateOfAdmission).toLocaleDateString() : '—'}</td>
                    <td style={tdStyle}>
                      <Link
                        to={`/admin/residents/${r.residentId}`}
                        style={{ color: '#2b6cb0', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <PaginationBtn
              label="← Prev"
              disabled={page <= 1}
              onClick={() => setFilter('page', String(page - 1))}
            />
            <span style={{ fontSize: '0.875rem', color: '#4a5568', padding: '0 0.5rem' }}>
              Page {page} of {totalPages}
            </span>
            <PaginationBtn
              label="Next →"
              disabled={page >= totalPages}
              onClick={() => setFilter('page', String(page + 1))}
            />
          </div>
        )}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '0.4rem 0.6rem',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.875rem',
          backgroundColor: value ? '#ebf8ff' : 'white',
          color: value ? '#2b6cb0' : '#4a5568',
          cursor: 'pointer',
        }}
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
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: `${color}18`,
      color,
    }}>
      {text}
    </span>
  );
}

function PaginationBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.4rem 0.9rem',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        backgroundColor: disabled ? '#f7fafc' : 'white',
        color: disabled ? '#a0aec0' : '#2b6cb0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        fontSize: '0.875rem',
      }}
    >
      {label}
    </button>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: '#4a5568',
  verticalAlign: 'middle',
};
