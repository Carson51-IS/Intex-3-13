import { useState } from 'react';
import { Link } from 'react-router-dom';
import { donorChurnPredictions, getChurnRiskLevel } from '../data/ml/donorChurn';
import { supporterDonationPredictions, getDonationLikelihood } from '../data/ml/supporterDonation';
import AdminLayout from '../components/AdminLayout';

type SortField = 'id' | 'risk' | 'probability';
type SortDir = 'asc' | 'desc';

const riskColors: Record<string, { bg: string; text: string }> = {
  High: { bg: '#fed7d7', text: '#c53030' },
  Medium: { bg: '#fefcbf', text: '#b7791f' },
  Low: { bg: '#c6f6d5', text: '#276749' },
};

export default function DonorInsightsPage() {
  const [churnSort, setChurnSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'risk', dir: 'desc' });
  const [donationSort, setDonationSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'probability', dir: 'desc' });

  const atRiskCount = donorChurnPredictions.filter(d => d.pIsLapsed >= 0.5).length;
  const likelyDonorCount = supporterDonationPredictions.filter(d => d.pWillDonate90d >= 0.5).length;
  const avgChurnRisk = donorChurnPredictions.reduce((s, d) => s + d.pIsLapsed, 0) / donorChurnPredictions.length;

  const sortedChurn = [...donorChurnPredictions].sort((a, b) => {
    const dir = churnSort.dir === 'asc' ? 1 : -1;
    if (churnSort.field === 'id') return (a.supporterId - b.supporterId) * dir;
    if (churnSort.field === 'probability') return (a.pIsLapsed - b.pIsLapsed) * dir;
    return (a.pIsLapsed - b.pIsLapsed) * dir;
  });

  const sortedDonation = [...supporterDonationPredictions].sort((a, b) => {
    const dir = donationSort.dir === 'asc' ? 1 : -1;
    if (donationSort.field === 'id') return (a.supporterId - b.supporterId) * dir;
    return (a.pWillDonate90d - b.pWillDonate90d) * dir;
  });

  function toggleSort(current: { field: SortField; dir: SortDir }, field: SortField, setter: (v: { field: SortField; dir: SortDir }) => void) {
    if (current.field === field) {
      setter({ field, dir: current.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      setter({ field, dir: 'desc' });
    }
  }

  function sortIndicator(current: { field: SortField; dir: SortDir }, field: SortField) {
    if (current.field !== field) return ' ';
    return current.dir === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <AdminLayout>
      <div className="mx-auto min-w-0 w-full max-w-6xl overflow-x-hidden break-words">
      <Link
        to="/admin/insights"
          className="mb-4 inline-block text-sm font-semibold text-primary no-underline hover:underline"
      >
        ← Back to ML-Powered Insights
      </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Donor Intelligence</h1>
        <p className="mb-8 mt-2 text-sm text-muted-foreground md:text-base">
        ML-powered donor analytics: churn risk detection and donation likelihood forecasting
      </p>

        <section className="mb-10 rounded-xl border border-info/30 bg-info/10 p-4 sm:p-6">
          <h2 className="font-heading text-lg font-semibold text-info">How to read this page</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground/80">
            <li><strong>Probabilities</strong> are the model’s estimate of an outcome (not a guarantee).</li>
            <li><strong>At-risk / likely</strong> summaries use a <strong>50%</strong> threshold (see Model Details).</li>
            <li><strong>Use these lists for prioritization</strong> (outreach, check-ins), then confirm with the donor’s record.</li>
          </ul>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legend: Churn probability bar</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <LegendSwatch color="#c53030" label="High (≥ 60%)" />
                <LegendSwatch color="#d69e2e" label="Medium (45–59%)" />
                <LegendSwatch color="#38a169" label="Low (< 45%)" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legend: 90-day donation probability bar</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <LegendSwatch color="#38a169" label="Higher likelihood (≥ 50%)" />
                <LegendSwatch color="#d69e2e" label="Possible (20–49%)" />
                <LegendSwatch color="#a0aec0" label="Unlikely (< 20%)" />
              </div>
            </div>
          </div>
        </section>

        <div className="mb-10 grid min-w-0 gap-3 sm:gap-4 md:grid-cols-3">
        <SummaryCard
          label="At-Risk Donors"
          value={atRiskCount.toString()}
          subtitle={`of ${donorChurnPredictions.length} tracked`}
          color="#c53030"
          bgColor="#fff5f5"
        />
        <SummaryCard
          label="Average Churn Risk"
          value={`${(avgChurnRisk * 100).toFixed(0)}%`}
          subtitle="across all donors"
          color="#dd6b20"
          bgColor="#fffaf0"
        />
        <SummaryCard
          label="Likely Donors (90d)"
          value={likelyDonorCount.toString()}
          subtitle={`of ${supporterDonationPredictions.length} tracked`}
          color="#38a169"
          bgColor="#f0fff4"
        />
      </div>

        <section className="mb-12">
          <h2 className="mb-4 border-l-4 border-destructive pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
          Donor Churn Risk
        </h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
          Identifies donors at risk of lapsing (no donation within 6 months). Higher probability means higher risk of losing the donor.
          Proactive outreach to high-risk donors can significantly improve retention.
        </p>
          <div className="-mx-1 overflow-x-auto min-w-0 rounded-xl border bg-card card-shadow sm:mx-0">
            <table className="min-w-[680px] w-full border-collapse text-sm">
            <thead>
                <tr className="border-b bg-muted/40">
                  <th className={`${thCn} cursor-pointer`} onClick={() => toggleSort(churnSort, 'id', setChurnSort)}>
                  Supporter ID{sortIndicator(churnSort, 'id')}
                </th>
                  <th className={thCn}>Snapshot Date</th>
                  <th className={`${thCn} cursor-pointer`} onClick={() => toggleSort(churnSort, 'probability', setChurnSort)}>
                  Churn Probability{sortIndicator(churnSort, 'probability')}
                </th>
                  <th className={`${thCn} cursor-pointer`} onClick={() => toggleSort(churnSort, 'risk', setChurnSort)}>
                  Risk Level{sortIndicator(churnSort, 'risk')}
                </th>
                  <th className={thCn}>Actual Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedChurn.map((d, i) => {
                const risk = getChurnRiskLevel(d.pIsLapsed);
                const colors = riskColors[risk];
                return (
                    <tr key={d.supporterId} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                      <td className={tdCn}>#{d.supporterId}</td>
                      <td className={tdCn}>{d.snapshotDate}</td>
                      <td className={tdCn}>
                      <div className="flex items-center gap-2">
                        <div style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          maxWidth: '100px',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${d.pIsLapsed * 100}%`,
                            backgroundColor: d.pIsLapsed >= 0.6 ? '#c53030' : d.pIsLapsed >= 0.45 ? '#d69e2e' : '#38a169',
                            borderRadius: '4px',
                          }} />
                        </div>
                        <span className="min-w-11 font-semibold">{(d.pIsLapsed * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                      <td className={tdCn}>
                      <span style={{
                        padding: '0.2rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}>
                        {risk}
                      </span>
                    </td>
                      <td className={tdCn}>
                      <span style={{
                        padding: '0.2rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: d.isLapsed ? '#fed7d7' : '#c6f6d5',
                        color: d.isLapsed ? '#c53030' : '#276749',
                      }}>
                        {d.isLapsed ? 'Lapsed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

        <section>
          <h2 className="mb-4 border-l-4 border-success pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
          90-Day Donation Forecast
        </h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
          Predicts which supporters are most likely to donate within the next 90 days.
          Use this to prioritize engagement outreach and personalize communications.
        </p>
          <div className="-mx-1 overflow-x-auto min-w-0 rounded-xl border bg-card card-shadow sm:mx-0">
            <table className="min-w-[680px] w-full border-collapse text-sm">
            <thead>
                <tr className="border-b bg-muted/40">
                  <th className={`${thCn} cursor-pointer`} onClick={() => toggleSort(donationSort, 'id', setDonationSort)}>
                  Supporter ID{sortIndicator(donationSort, 'id')}
                </th>
                  <th className={thCn}>Snapshot Date</th>
                  <th className={`${thCn} cursor-pointer`} onClick={() => toggleSort(donationSort, 'probability', setDonationSort)}>
                  Donation Probability{sortIndicator(donationSort, 'probability')}
                </th>
                  <th className={thCn}>Likelihood</th>
                  <th className={thCn}>Actual</th>
              </tr>
            </thead>
            <tbody>
              {sortedDonation.map((d, i) => {
                const likelihood = getDonationLikelihood(d.pWillDonate90d);
                const colors = riskColors[likelihood === 'High' ? 'Low' : likelihood === 'Low' ? 'High' : 'Medium'];
                return (
                    <tr key={d.supporterId} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                      <td className={tdCn}>#{d.supporterId}</td>
                      <td className={tdCn}>{d.snapshotDate}</td>
                      <td className={tdCn}>
                        <div className="flex items-center gap-2">
                        <div style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          maxWidth: '100px',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${d.pWillDonate90d * 100}%`,
                            backgroundColor: d.pWillDonate90d >= 0.5 ? '#38a169' : d.pWillDonate90d >= 0.2 ? '#d69e2e' : '#a0aec0',
                            borderRadius: '4px',
                          }} />
                        </div>
                          <span className="min-w-11 font-semibold">{(d.pWillDonate90d * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                      <td className={tdCn}>
                      <span style={{
                        padding: '0.2rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}>
                        {likelihood}
                      </span>
                    </td>
                      <td className={tdCn}>
                      <span style={{
                        padding: '0.2rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: d.actualDonated ? '#c6f6d5' : '#e2e8f0',
                        color: d.actualDonated ? '#276749' : '#718096',
                      }}>
                        {d.actualDonated ? 'Donated' : 'No donation'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

        <section className="mt-10 rounded-xl border border-info/30 bg-info/10 p-4 sm:p-6">
          <h3 className="mb-2 font-heading text-lg font-semibold text-info">Model Details</h3>
          <p className="m-0 text-sm leading-relaxed text-foreground/80">
          <strong>Donor Churn:</strong> Logistic Regression & Random Forest models trained on donation history features
          (recency, frequency, tenure, donation mix). Uses temporal snapshots to prevent data leakage. Threshold: 50%.
          <br />
          <strong>90-Day Forecast:</strong> Logistic Regression with balanced class weights, trained on donation patterns
          and supporter demographics. Predictions are decision-support tools — always combine with staff judgment.
        </p>
      </section>
      </div>
    </AdminLayout>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-background px-2 py-1">
      <span
        aria-hidden="true"
        style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}

function SummaryCard({ label, value, subtitle, color, bgColor }: {
  label: string; value: string; subtitle: string; color: string; bgColor: string;
}) {
  return (
    <div className="min-w-0 min-w-0 rounded-xl border bg-card p-4 sm:p-6 card-shadow" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div style={{ color }} className="text-2xl font-bold leading-none sm:text-3xl">{value}</div>
      <div style={{
        marginTop: '0.5rem',
        backgroundColor: bgColor,
        display: 'inline-block'
      }}>
        <span className="rounded-md px-2 py-0.5 text-xs text-muted-foreground">{subtitle}</span>
        
      </div>
    </div>
  );
}
const thCn = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap';
const tdCn = 'px-4 py-3 text-foreground';
