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
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#1a365d', fontWeight: 700, marginBottom: '0.25rem' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>
            Overview of active operations — as of today
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #fed7d7', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Risk Breakdown */}
          <div style={cardStyle}>
            <h2 style={cardTitle}>Residents by Risk Level</h2>
            {data ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(['Critical', 'High', 'Medium', 'Low'] as const).map((level) => {
                  const entry = data.riskBreakdown.find(r => r.riskLevel === level);
                  const count = entry?.count ?? 0;
                  const total = data.riskBreakdown.reduce((sum, r) => sum + r.count, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={level}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 600, color: riskColors[level] }}>{level}</span>
                        <span style={{ color: '#4a5568' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: riskColors[level],
                          borderRadius: '4px',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Loading…</div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={cardStyle}>
            <h2 style={cardTitle}>Quick Navigation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { to: '/admin/residents', label: 'Caseload Inventory', desc: 'View & manage resident records', icon: '📋' },
                { to: '/admin/donors', label: 'Donors & Contributions', desc: 'Supporter profiles & donations', icon: '💝' },
                { to: '/admin/reports', label: 'Reports & Analytics', desc: 'Trends, outcomes, performance', icon: '📊' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: '#f7fafc',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    border: '1px solid #e2e8f0',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2b6cb0', fontSize: '0.9rem' }}>{item.label}</div>
                    <div style={{ color: '#718096', fontSize: '0.8rem' }}>{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Risk Alert */}
        {data && data.riskBreakdown.some(r => r.riskLevel === 'Critical' && r.count > 0) && (
          <div style={{ padding: '1rem', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #fed7d7', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            <div>
              <div style={{ fontWeight: 700, color: '#c53030', fontSize: '0.95rem' }}>Critical Risk Residents Require Immediate Attention</div>
              <div style={{ color: '#c53030', fontSize: '0.85rem' }}>
                {data.riskBreakdown.find(r => r.riskLevel === 'Critical')?.count} resident(s) at critical risk level.{' '}
                <Link to="/admin/residents?riskLevel=Critical" style={{ color: '#c53030', fontWeight: 600 }}>View records →</Link>
              </div>
            </div>
          </div>
        )}

        {/* ML Insights Section */}
        <h2 style={{
          fontSize: '1.3rem',
          color: '#1a365d',
          marginBottom: '1.25rem',
          paddingLeft: '1rem',
          borderLeft: '4px solid #4299e1',
        }}>
          ML-Powered Insights
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      border: '1px solid #e2e8f0',
    }}>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.3rem' }}>{label}</div>
      </div>
    </div>
  );
}

function InsightCard({ title, description, stat, statLabel, color, link }: {
  title: string; description: string; stat: string; statLabel: string; color: string; link: string;
}) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${color}`,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#2d3748', margin: 0 }}>{title}</h3>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color, lineHeight: 1 }}>{stat}</div>
            <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>{statLabel}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#718096', lineHeight: 1.5, margin: 0 }}>{description}</p>
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600 }}>
          View details →
        </div>
      </div>
    </Link>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '1.25rem 1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  border: '1px solid #e2e8f0',
};

const cardTitle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#2d3748',
  marginBottom: '1rem',
};
