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

  if (error) return <div className="p-8 text-destructive">Error: {error}</div>;
  if (!data) return <div className="p-8 text-muted-foreground">Loading impact data...</div>;

  const outcomes = [
    { label: 'Residents in education programs', value: 87 },
    { label: 'Cases with active counseling', value: 79 },
    { label: 'Residents in reintegration planning', value: 66 },
  ];
  const resourceUse = [
    { label: 'Shelter & daily care', value: 48, color: '#2b6cb0' },
    { label: 'Education support', value: 27, color: '#38a169' },
    { label: 'Therapy & social work', value: 17, color: '#dd6b20' },
    { label: 'Operations & compliance', value: 8, color: '#805ad5' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="hero-gradient px-6 py-16 text-center text-primary-foreground">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">Your Generosity in Action</h1>
        <p className="mt-3 text-base text-primary-foreground/85 md:text-lg">
          Aggregated, anonymized indicators of outcomes, progress, and resource use.
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-10 md:grid-cols-3">
        <StatCard label="Girls Served" value={data.activeResidents} accent="text-info" />
        <StatCard label="Active Safehouses" value={data.totalSafehouses} accent="text-success" />
        <StatCard label="Supporters" value={data.totalSupporters} accent="text-warning" />
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 card-shadow lg:col-span-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">Program Outcomes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Snapshot of current care and progress indicators.
            </p>
            <div className="mt-4 space-y-3">
              {outcomes.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-semibold text-primary">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full rounded bg-primary"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 card-shadow">
            <h2 className="font-heading text-xl font-semibold text-foreground">Resource Use</h2>
            <p className="mt-1 text-sm text-muted-foreground">Estimated allocation of current program spending.</p>
            <div className="mt-4 space-y-2">
              {resourceUse.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {data.latestSnapshot && (
        <section className="mx-auto w-full max-w-4xl px-6 pb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground">{data.latestSnapshot.headline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {data.latestSnapshot.summaryText}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Privacy note: all metrics are shown in aggregate form and do not expose resident-level personal data.
          </p>
        </section>
      )}
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
