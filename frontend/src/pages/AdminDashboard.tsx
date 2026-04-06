import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
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

export default function AdminDashboard() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminSummary>('/dashboard/admin-summary')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div style={{ padding: '2rem', color: '#c53030' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  const riskColors: Record<string, string> = {
    Critical: '#c53030',
    High: '#dd6b20',
    Medium: '#d69e2e',
    Low: '#38a169',
  };

  const atRiskDonors = donorChurnPredictions.filter(d => d.pIsLapsed >= 0.5).length;
  const likelyDonors = supporterDonationPredictions.filter(d => d.pWillDonate90d >= 0.5).length;
  const flaggedSafehouses = getLatestForecasts().filter(f => f.maxPredicted > 0).length;
  const readyResidents = reintegrationPredictions.filter(r => r.predictedStatus === 'Completed').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <KpiCard label="Active Residents" value={data.activeResidents.toString()} color="#2b6cb0" />
        <KpiCard label="Donations (30 days)" value={`₱${data.recentDonationsTotal.toLocaleString()}`} color="#38a169" />
        <KpiCard label="Incidents (30 days)" value={data.incidentsThisMonth.toString()} color="#dd6b20" />
      </div>

      {/* Risk Breakdown */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        marginBottom: '2.5rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#2d3748' }}>Residents by Risk Level</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {data.riskBreakdown.map((r) => (
            <div key={r.riskLevel} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              backgroundColor: `${riskColors[r.riskLevel] ?? '#718096'}20`,
              color: riskColors[r.riskLevel] ?? '#718096',
              fontWeight: 600,
            }}>
              <span>{r.riskLevel}:</span>
              <span>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

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
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>{label}</div>
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
