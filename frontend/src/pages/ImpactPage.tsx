import { useEffect, useState } from 'react';
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
        padding: '3rem 2rem',
        background: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Your Generosity in Action</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>See the real impact of your support</p>
      </section>

      <section style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '3rem',
        padding: '3rem 2rem',
        flexWrap: 'wrap',
      }}>
        <StatCard label="Girls Served" value={data.activeResidents} />
        <StatCard label="Active Safehouses" value={data.totalSafehouses} />
        <StatCard label="Supporters" value={data.totalSupporters} />
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
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      minWidth: '150px',
    }}>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2b6cb0' }}>{value}</div>
      <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem' }}>{label}</div>
    </div>
  );
}
