import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AdminLayout from '../components/AdminLayout';

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

const riskBg: Record<string, string> = {
  Critical: '#fff5f5',
  High: '#fffaf0',
  Medium: '#fffff0',
  Low: '#f0fff4',
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminSummary>('/dashboard/admin-summary')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

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

        {/* Risk Cards */}
        {data && data.riskBreakdown.some(r => r.riskLevel === 'Critical' && r.count > 0) && (
          <div style={{ padding: '1rem', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #fed7d7', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
