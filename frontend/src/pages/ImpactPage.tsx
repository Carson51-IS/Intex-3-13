import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface PublicImpact {
  activeResidents: number;
  totalSafehouses: number;
  totalSupporters: number;
  latestSnapshot: {
    headline: string;
    summaryText: string;
  } | null;
}

export default function ImpactPage() {
  const [data, setData] = useState<PublicImpact | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<PublicImpact>('/dashboard/public-impact')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div style={{ padding: '2rem', color: '#c53030' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Loading impact data...</div>;

  return (
    <div>
      <section style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        background: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>Your Generosity in Action</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>See the real impact of your support</p>
      </section>

      <section style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        padding: '3.5rem 2rem',
        flexWrap: 'wrap',
      }}>
        <StatCard label="Girls Served" value={data.activeResidents} color="#2b6cb0" />
        <StatCard label="Active Safehouses" value={data.totalSafehouses} color="#38a169" />
        <StatCard label="Supporters" value={data.totalSupporters} color="#dd6b20" />
      </section>

      {data.latestSnapshot && (
        <section style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1a365d', marginBottom: '1rem' }}>
            {data.latestSnapshot.headline}
          </h2>
          <p style={{ color: '#4a5568', lineHeight: 1.8 }}>
            {data.latestSnapshot.summaryText}
          </p>
        </section>
      )}

      {/* Link to Insights */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: 'linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)',
      }}>
        <h2 style={{ fontSize: '1.5rem', color: '#1a365d', marginBottom: '0.75rem' }}>
          Explore Our Data-Driven Strategy
        </h2>
        <p style={{ color: '#4a5568', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          See how we use machine learning to optimize social media outreach and maximize the impact of every post.
        </p>
        <Link
          to="/insights"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#2b6cb0',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(43,108,176,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          View Social Media Insights
        </Link>
      </section>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem 2.5rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      borderTop: `4px solid ${color}`,
      minWidth: '160px',
    }}>
      <div style={{ fontSize: '2.75rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem' }}>{label}</div>
    </div>
  );
}
