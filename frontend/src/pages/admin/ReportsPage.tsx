import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { formatAmountWithPreference, getAccountPreferences } from '../../lib/accountPreferences';

interface DonationTrend { label: string; total: number; count: number; }
interface DonationType { type: string; count: number; total: number; }
interface SafehousePerf {
  safehouseId: number;
  name: string;
  status: string;
  capacityGirls: number;
  currentOccupancy: number;
  activeResidents: number;
  closedResidents: number;
  reintegratedResidents: number;
}
interface CaseCategory { category: string; count: number; }
interface ReintegrationStats {
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
}
interface AdmissionTrend { label: string; count: number; }

export default function ReportsPage() {
  const { user } = useAuth();
  const [donationTrends, setDonationTrends] = useState<DonationTrend[]>([]);
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [safehouses, setSafehouses] = useState<SafehousePerf[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [reintegration, setReintegration] = useState<ReintegrationStats | null>(null);
  const [admissions, setAdmissions] = useState<AdmissionTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currencyPreference, setCurrencyPreference] = useState<'PHP' | 'USD'>('PHP');

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [dt, dbt, sp, cc, ri, at] = await Promise.all([
          api.get<DonationTrend[]>('/reports/donation-trends'),
          api.get<DonationType[]>('/reports/donation-by-type'),
          api.get<SafehousePerf[]>('/reports/safehouse-performance'),
          api.get<CaseCategory[]>('/reports/case-categories'),
          api.get<ReintegrationStats>('/reports/reintegration-stats'),
          api.get<AdmissionTrend[]>('/reports/admission-trends'),
        ]);
        setDonationTrends(dt);
        setDonationTypes(dbt);
        setSafehouses(sp);
        setCategories(cc);
        setReintegration(ri);
        setAdmissions(at);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fallbackName = user.userName?.trim() || user.email.split('@')[0] || user.email;
    const prefs = getAccountPreferences(user.email, fallbackName);
    setCurrencyPreference(prefs.currency);
  }, [user]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-16 text-center text-muted-foreground">Loading reports…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggregated insights and trends for decision-making
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Donation Trends */}
          <ReportCard
            title="Donation Trends (Last 12 Months)"
            subtitle={`Total: ${formatAmountWithPreference(donationTrends.reduce((s, d) => s + d.total, 0), currencyPreference)}`}
          >
            <BarChart
              data={donationTrends.map(d => ({ label: d.label.split(' ')[0], value: d.total }))}
              color="#38a169"
              formatValue={(v) => {
                if (currencyPreference === 'USD') {
                  const usd = v / 56;
                  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
                  return `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                }
                return `₱${(v / 1000).toFixed(0)}k`;
              }}
            />
          </ReportCard>

          {/* Admission Trends */}
          <ReportCard title="Monthly Admissions (Last 12 Months)" subtitle={`Total: ${admissions.reduce((s, a) => s + a.count, 0)} admissions`}>
            <BarChart
              data={admissions.map(a => ({ label: a.label.split(' ')[0], value: a.count }))}
              color="#2b6cb0"
              formatValue={(v) => v.toString()}
            />
          </ReportCard>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Donation by Type */}
          <ReportCard title="Donations by Type">
            {donationTypes.length === 0 ? (
              <EmptyState />
            ) : (
              <HorizontalBarChart
                data={donationTypes.map(d => ({ label: d.type, value: d.count }))}
                color="#805ad5"
              />
            )}
          </ReportCard>

          {/* Case Categories */}
          <ReportCard title="Residents by Case Category">
            {categories.length === 0 ? (
              <EmptyState />
            ) : (
              <HorizontalBarChart
                data={categories.map(c => ({ label: c.category, value: c.count }))}
                color="#dd6b20"
              />
            )}
          </ReportCard>
        </div>

        {/* Safehouse Performance */}
        <ReportCard title="Safehouse Performance" subtitle="Occupancy vs. capacity and resident outcomes">
          {safehouses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2">
                    {['Safehouse', 'Status', 'Capacity', 'Active', 'Occupancy %', 'Closed', 'Reintegrated'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safehouses.map((s, i) => {
                    const pct = s.capacityGirls > 0 ? Math.round((s.activeResidents / s.capacityGirls) * 100) : 0;
                    const pctColor = pct >= 90 ? '#c53030' : pct >= 75 ? '#dd6b20' : '#38a169';
                    return (
                      <tr key={s.safehouseId} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                        <td className="px-3 py-2.5 font-semibold text-foreground">{s.name}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-semibold ${s.status === 'Active' ? 'text-success' : 'text-muted-foreground'}`}>{s.status}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">{s.capacityGirls}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-primary">{s.activeResidents}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded bg-muted">
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pctColor, borderRadius: '4px' }} />
                            </div>
                            <span style={{ color: pctColor }} className="min-w-9 text-xs font-bold">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-muted-foreground">{s.closedResidents}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-success">{s.reintegratedResidents}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ReportCard>

        {/* Reintegration */}
        {reintegration && (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ReportCard title="Reintegration by Status">
              {reintegration.byStatus.length === 0 ? (
                <EmptyState />
              ) : (
                <HorizontalBarChart
                  data={reintegration.byStatus.map(s => ({ label: s.status ?? 'Unknown', value: s.count }))}
                  color="#38a169"
                />
              )}
            </ReportCard>
            <ReportCard title="Reintegration by Type">
              {reintegration.byType.length === 0 ? (
                <EmptyState />
              ) : (
                <HorizontalBarChart
                  data={reintegration.byType.map(t => ({ label: t.type ?? 'Unknown', value: t.count }))}
                  color="#4299e1"
                />
              )}
            </ReportCard>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ReportCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-6 card-shadow">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function BarChart({ data, color, formatValue }: { data: { label: string; value: number }[]; color: string; formatValue: (v: number) => string }) {
  if (data.length === 0) return <EmptyState />;
  const max = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 140;

  return (
    <div>
      <svg width="100%" height={chartHeight + 30} viewBox={`0 0 ${data.length * 44} ${chartHeight + 30}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barHeight = d.value <= 0 ? 0 : Math.max((d.value / max) * chartHeight, 2);
          const x = i * 44 + 4;
          const y = chartHeight - barHeight;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={36}
                height={barHeight}
                fill={color}
                rx={3}
                opacity={d.value <= 0 ? 0.2 : 0.85}
              />
              <text x={x + 18} y={chartHeight + 14} textAnchor="middle" fontSize="9" fill="#a0aec0">{d.label}</text>
              {d.value > 0 && (
                <text x={x + 18} y={Math.max(y - 4, 10)} textAnchor="middle" fontSize="8" fill={color} fontWeight="600">
                  {formatValue(d.value)}
                </text>
              )}
            </g>
          );
        })}
        <line x1="0" y1={chartHeight} x2={data.length * 44} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    </div>
  );
}

function HorizontalBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex flex-col gap-2">
      {data.slice(0, 8).map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="max-w-[70%] overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">{d.label}</span>
            <span style={{ color }} className="font-bold">{d.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded bg-muted">
            <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, backgroundColor: color, borderRadius: '3px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return <div className="p-8 text-center text-sm text-muted-foreground">No data available</div>;
}
