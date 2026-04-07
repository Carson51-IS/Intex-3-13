import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AdminLayout from '../components/AdminLayout';
import { donorChurnPredictions } from '../data/ml/donorChurn';
import { supporterDonationPredictions } from '../data/ml/supporterDonation';
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
  const likelyDonors = supporterDonationPredictions.filter(d => d.pWillDonate90d >= 0.5).length;
  const flaggedSafehouses = getLatestForecasts().filter(f => f.maxPredicted > 0).length;
  const readyResidents = reintegrationPredictions.filter(r => r.predictedStatus === 'Completed').length;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Overview of active operations - as of today
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            label="Active Residents"
            value={data ? data.activeResidents.toString() : '—'}
            color="#2b6cb0"
            icon="👥"
          />
          <KpiCard
            label="Donations (30 days)"
            value={data ? `₱${data.recentDonationsTotal.toLocaleString()}` : '—'}
            color="#38a169"
            icon="💰"
          />
          <KpiCard
            label="Incidents (30 days)"
            value={data ? data.incidentsThisMonth.toString() : '—'}
            color={data && data.incidentsThisMonth > 0 ? '#dd6b20' : '#38a169'}
            icon="⚠️"
          />
        </div>

        <div className="mb-8">
          <div className="rounded-xl border bg-card p-6 card-shadow">
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
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: riskColors[level],
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="text-sm text-muted-foreground">Loading…</div>}
          </div>
        </div>

        {data && data.riskBreakdown.some(r => r.riskLevel === 'Critical' && r.count > 0) && (
          <div className="mb-8 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="text-sm font-bold text-destructive">Critical Risk Residents Require Immediate Attention</div>
              <div className="text-sm text-destructive">
                {data.riskBreakdown.find(r => r.riskLevel === 'Critical')?.count} resident(s) at critical risk level.{' '}
                <Link to="/admin/residents?riskLevel=Critical" className="font-semibold underline">View records →</Link>
              </div>
            </div>
          </div>
        )}

        <h2 className="mb-5 border-l-4 border-primary pl-4 font-heading text-2xl font-semibold text-foreground">
          ML-Powered Insights
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InsightCard
            title="Donor Churn Risk"
            description={`${atRiskDonors} of ${donorChurnPredictions.length} donors are at risk of lapsing. Review the full analysis to prioritize retention outreach.`}
            stat={atRiskDonors.toString()}
            statLabel="at risk"
            color="#c53030"
            link="/admin/donor-insights"
          />
          <InsightCard
            title="90-Day Donation Forecast"
            description={`${likelyDonors} supporters have a high probability of donating in the next 90 days. Focus engagement on these high-potential donors.`}
            stat={likelyDonors.toString()}
            statLabel="likely donors"
            color="#38a169"
            link="/admin/donor-insights"
          />
          <InsightCard
            title="Reintegration Readiness"
            description={`${readyResidents} residents are predicted ready for reintegration. Review assessments and probability breakdowns.`}
            stat={readyResidents.toString()}
            statLabel="predicted ready"
            color="#3182ce"
            link="/admin/resident-insights"
          />
          <InsightCard
            title="Incident Forecast"
            description={`${flaggedSafehouses} safehouse(s) flagged with elevated incident risk. Review monthly forecasts and staffing needs.`}
            stat={flaggedSafehouses.toString()}
            statLabel="flagged"
            color="#dd6b20"
            link="/admin/resident-insights"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function KpiCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 card-shadow">
      <span className="text-3xl">{icon}</span>
      <div>
        <div style={{ color }} className="text-3xl font-bold leading-none">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function InsightCard({ title, description, stat, statLabel, color, link }: {
  title: string; description: string; stat: string; statLabel: string; color: string; link: string;
}) {
  return (
    <Link to={link} className="block rounded-xl border bg-card p-6 card-shadow transition-shadow hover:card-shadow-hover" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
        <div className="text-right">
          <div style={{ color }} className="text-2xl font-bold leading-none">{stat}</div>
          <div className="text-[11px] text-muted-foreground">{statLabel}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-3 text-sm font-semibold text-primary">
        View details →
      </div>
    </Link>
  );
}

