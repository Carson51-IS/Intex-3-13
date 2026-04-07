import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

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
  const [donationTrends, setDonationTrends] = useState<DonationTrend[]>([]);
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [safehouses, setSafehouses] = useState<SafehousePerf[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [reintegration, setReintegration] = useState<ReintegrationStats | null>(null);
  const [admissions, setAdmissions] = useState<AdmissionTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (isLoading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#a0aec0' }}>Loading reports…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#1a365d', fontWeight: 700, marginBottom: '0.25rem' }}>
            Reports & Analytics
          </h1>
          <p style={{ color: '#718096', fontSize: '0.875rem' }}>
            Aggregated insights and trends for decision-making
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #fed7d7', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Donation Trends */}
          <ReportCard title="Donation Trends (Last 12 Months)" subtitle={`Total: ₱${donationTrends.reduce((s, d) => s + d.total, 0).toLocaleString()}`}>
            <BarChart
              data={donationTrends.map(d => ({ label: d.label.split(' ')[0], value: d.total }))}
              color="#38a169"
              formatValue={(v) => `₱${(v / 1000).toFixed(0)}k`}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    {['Safehouse', 'Status', 'Capacity', 'Active', 'Occupancy %', 'Closed', 'Reintegrated'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#718096', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safehouses.map((s, i) => {
                    const pct = s.capacityGirls > 0 ? Math.round((s.activeResidents / s.capacityGirls) * 100) : 0;
                    const pctColor = pct >= 90 ? '#c53030' : pct >= 75 ? '#dd6b20' : '#38a169';
                    return (
                      <tr key={s.safehouseId} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#2d3748' }}>{s.name}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: s.status === 'Active' ? '#38a169' : '#718096' }}>{s.status}</span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{s.capacityGirls}</td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#2b6cb0' }}>{s.activeResidents}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pctColor, borderRadius: '4px' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pctColor, minWidth: '36px' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#718096' }}>{s.closedResidents}</td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#38a169', fontWeight: 600 }}>{s.reintegratedResidents}</td>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
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
    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2d3748', marginBottom: '0.2rem' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '0.8rem', color: '#718096' }}>{subtitle}</p>}
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
          const barHeight = Math.max((d.value / max) * chartHeight, 2);
          const x = i * 44 + 4;
          const y = chartHeight - barHeight;
          return (
            <g key={i}>
              <rect x={x} y={y} width={36} height={barHeight} fill={color} rx={3} opacity={0.85} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {data.slice(0, 8).map((d) => (
        <div key={d.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.8rem' }}>
            <span style={{ color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{d.label}</span>
            <span style={{ fontWeight: 700, color }}>{d.value}</span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, backgroundColor: color, borderRadius: '3px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return <div style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem', fontSize: '0.875rem' }}>No data available</div>;
}
