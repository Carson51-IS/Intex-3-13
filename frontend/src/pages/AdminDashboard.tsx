import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AdminLayout from '../components/AdminLayout';
import { donorChurnPredictions } from '../data/ml/donorChurn';
import { getLatestForecasts } from '../data/ml/safehouseIncidents';
import { reintegrationPredictions } from '../data/ml/reintegrationReadiness';

interface AdminSummary {
  activeResidents: number;
  recentDonationsTotal: number;
  incidentsThisMonth: number;
  riskBreakdown: { riskLevel: string; count: number }[];
}

const riskColors: Record<string, string> = {
  Critical: '#c53030',
  High: '#dd6b20',
  Medium: '#d69e2e',
  Low: '#38a169',
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminSummary>('/dashboard/admin-summary')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const atRiskDonors = donorChurnPredictions.filter(d => d.pIsLapsed >= 0.5).length;
  const flaggedSafehouses = getLatestForecasts().filter(f => f.maxPredicted > 0).length;
  const readyResidents = reintegrationPredictions.filter(r => r.predictedStatus === 'Completed').length;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of active operations - as of today</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            label="Active Residents"
            value={data ? data.activeResidents.toString() : '—'}
            accent="text-info"
            icon="Residents"
          />
          <KpiCard
            label="Donations (30 days)"
            value={data ? `₱${data.recentDonationsTotal.toLocaleString()}` : '—'}
            accent="text-success"
            icon="Donations"
          />
          <KpiCard
            label="Incidents (30 days)"
            value={data ? data.incidentsThisMonth.toString() : '—'}
            accent={data && data.incidentsThisMonth > 0 ? 'text-warning' : 'text-success'}
            icon="Incidents"
          />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <h2 className="mb-4 font-heading text-xl font-semibold text-card-foreground">Residents by Risk Level</h2>
            {data ? (
              <div className="space-y-3">
                {(['Critical', 'High', 'Medium', 'Low'] as const).map((level) => {
                  const entry = data.riskBreakdown.find(r => r.riskLevel === level);
                  const count = entry?.count ?? 0;
                  const total = data.riskBreakdown.reduce((sum, r) => sum + r.count, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={level}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span style={{ color: riskColors[level] }} className="font-semibold">{level}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-muted">
                        <div
                          className="h-full rounded transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: riskColors[level] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 card-shadow">
            <h2 className="mb-4 font-heading text-xl font-semibold text-card-foreground">Priority Alerts</h2>
            <div className="space-y-3">
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                <p className="text-sm font-semibold text-warning-foreground">Safehouse Incident Forecasts</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {flaggedSafehouses} safehouse(s) flagged with elevated incident risk this month.
                </p>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm font-semibold text-destructive">Donor Churn Risk</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {atRiskDonors} donors are currently at high risk of lapsing.
                </p>
              </div>
              <div className="rounded-lg border border-success/30 bg-success/10 p-3">
                <p className="text-sm font-semibold text-success">Reintegration Progress</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readyResidents} residents are predicted ready for reintegration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {data && data.riskBreakdown.some(r => r.riskLevel === 'Critical' && r.count > 0) && (
          <div className="mb-8 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <span className="mt-0.5 text-lg">🚨</span>
            <div>
              <div className="text-sm font-semibold text-destructive">Critical risk residents require immediate attention</div>
              <div className="text-sm text-destructive">
                {data.riskBreakdown.find(r => r.riskLevel === 'Critical')?.count} resident(s) at critical risk level.{' '}
                <Link to="/admin/residents?riskLevel=Critical" className="font-semibold underline underline-offset-2">View records</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function KpiCard({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 card-shadow">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{icon}</p>
      <div>
        <div className={`mt-2 text-3xl font-bold leading-none ${accent}`}>{value}</div>
        <div className="mt-2 text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

