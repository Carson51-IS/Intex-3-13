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

  if (error) return <div className="p-8 text-destructive">Error: {error}</div>;
  if (!data) return <div className="p-8 text-muted-foreground">Loading impact data...</div>;

  return (
    <div className="min-h-screen bg-background">
      <section className="hero-gradient px-6 py-16 text-center text-primary-foreground">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">Your Generosity in Action</h1>
        <p className="mt-3 text-base text-primary-foreground/85 md:text-lg">See the real impact of your support</p>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-10 md:grid-cols-3">
        <StatCard label="Girls Served" value={data.activeResidents} accent="text-info" />
        <StatCard label="Active Safehouses" value={data.totalSafehouses} accent="text-success" />
        <StatCard label="Supporters" value={data.totalSupporters} accent="text-warning" />
      </section>

      {data.latestSnapshot && (
        <section className="mx-auto w-full max-w-3xl px-6 pb-8 text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground">{data.latestSnapshot.headline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {data.latestSnapshot.summaryText}
          </p>
        </section>
      )}

      <section className="mx-6 mb-10 rounded-2xl border border-info/30 bg-info/10 px-6 py-10 text-center">
        <h2 className="font-heading text-2xl font-semibold text-foreground">Explore Our Data-Driven Strategy</h2>
        <p className="mx-auto mb-6 mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          See how we use machine learning to optimize social media outreach and maximize the impact of every post.
        </p>
        <Link
          to="/insights"
          className="inline-block rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground no-underline transition-opacity hover:opacity-90"
        >
          View Social Media Insights
        </Link>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center card-shadow">
      <div className={`text-5xl font-bold ${accent}`}>{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
