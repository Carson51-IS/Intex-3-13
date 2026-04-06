import { useEffect, useState } from 'react';
import { api } from '../api/client';

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

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <KpiCard label="Active Residents" value={data.activeResidents.toString()} />
        <KpiCard label="Donations (30 days)" value={`₱${data.recentDonationsTotal.toLocaleString()}`} />
        <KpiCard label="Incidents (30 days)" value={data.incidentsThisMonth.toString()} />
      </div>

      {/* Risk Breakdown */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d3748' }}>Residents by Risk Level</h2>
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
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2b6cb0' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>{label}</div>
    </div>
  );
}
