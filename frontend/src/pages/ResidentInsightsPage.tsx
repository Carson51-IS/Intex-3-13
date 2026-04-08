import { Link } from 'react-router-dom';
import { reintegrationPredictions, statusColors } from '../data/ml/reintegrationReadiness';
import { safehouseIncidentForecasts, getLatestForecasts } from '../data/ml/safehouseIncidents';
import AdminLayout from '../components/AdminLayout';

export default function ResidentInsightsPage() {
  const forecasts = getLatestForecasts();
  const flaggedSafehouses = forecasts.filter(f => f.maxPredicted > 0);

  const statusCounts = reintegrationPredictions.reduce((acc, r) => {
    acc[r.predictedStatus] = (acc[r.predictedStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="mx-auto min-w-0 w-full max-w-6xl overflow-x-hidden break-words">
        <Link
          to="/admin/insights"
          className="mb-4 inline-block text-sm font-semibold text-primary no-underline hover:underline"
        >
          ← Back to ML-Powered Insights
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Resident Care Intelligence</h1>
        <p className="mb-8 mt-2 text-sm text-muted-foreground md:text-base">
          ML-powered resident analytics: reintegration readiness assessment and safehouse incident forecasting.
        </p>

        <section className="mb-10 rounded-xl border border-info/30 bg-info/10 p-4 sm:p-6">
          <h2 className="font-heading text-lg font-semibold text-info">How to read this page</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground/80">
            <li><strong>Predicted status</strong> is the most likely reintegration outcome based on the probability breakdown.</li>
            <li><strong>Probability bars</strong> sum to 100% (hover segments to see exact percentages).</li>
            <li><strong>Match</strong> compares the prediction to the current recorded status; mismatches are a review prompt, not an error.</li>
            <li><strong>Incident forecasts</strong> are decision-support signals for staffing/safety planning, not guarantees.</li>
          </ul>
        </section>

        <div className="mb-10 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="min-w-0 rounded-xl border bg-card p-5 text-center card-shadow"
              style={{ borderTop: `4px solid ${statusColors[status] ?? '#718096'}` }}
            >
              <div style={{ color: statusColors[status] ?? '#718096' }} className="text-2xl font-bold sm:text-3xl">{count}</div>
              <div className="mt-1 text-sm text-muted-foreground">Predicted {status}</div>
            </div>
          ))}
          <div
            className="min-w-0 rounded-xl border bg-card p-5 text-center card-shadow"
            style={{ borderTop: `4px solid ${flaggedSafehouses.length > 0 ? '#dd6b20' : '#38a169'}` }}
          >
            <div
              style={{ color: flaggedSafehouses.length > 0 ? '#dd6b20' : '#38a169' }}
              className="text-2xl font-bold sm:text-3xl"
            >
              {flaggedSafehouses.length}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Safehouses Flagged</div>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="mb-4 border-l-4 border-primary pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
          Reintegration Readiness Assessment
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
          Predicts each resident's reintegration readiness status based on counseling sessions, education progress,
            health scores, intervention plans, and behavioral incidents. These predictions support, but never replace,
            staff decision-making.
          </p>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide text-muted-foreground">Legend</span>
            <span className="text-muted-foreground/70">•</span>
            <span>Stacked bar = probability distribution</span>
            <span className="text-muted-foreground/70">•</span>
            <span>Colors match the status labels</span>
          </div>
          <div className="-mx-1 overflow-x-auto min-w-0 rounded-xl border bg-card card-shadow sm:mx-0">
            <table className="min-w-[680px] w-full border-collapse text-sm">
            <thead>
                <tr className="border-b bg-muted/40">
                  <th className={thCn}>Resident ID</th>
                  <th className={thCn}>Predicted Status</th>
                  <th className={thCn}>Probability Breakdown</th>
                  <th className={thCn}>Actual Status</th>
                  <th className={thCn}>Match</th>
              </tr>
            </thead>
            <tbody>
              {reintegrationPredictions.map((r, i) => {
                const isMatch = r.predictedStatus === r.actualStatus;
                const probs = [
                  { label: 'Completed', value: r.pCompleted, color: statusColors['Completed'] },
                  { label: 'In Progress', value: r.pInProgress, color: statusColors['In Progress'] },
                  { label: 'Not Started', value: r.pNotStarted, color: statusColors['Not Started'] },
                  { label: 'On Hold', value: r.pOnHold, color: statusColors['On Hold'] },
                ].filter(p => p.value > 0);

                return (
                    <tr key={r.residentId} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                      <td className={tdCn}>#{r.residentId}</td>
                      <td className={tdCn}>
                      <span style={{
                        padding: '0.2rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: `${statusColors[r.predictedStatus]}20`,
                        color: statusColors[r.predictedStatus],
                      }}>
                        {r.predictedStatus}
                      </span>
                    </td>
                      <td className={tdCn}>
                        <div className="flex h-5 overflow-hidden rounded bg-muted">
                        {probs.map((p) => (
                          <div
                            key={p.label}
                            title={`${p.label}: ${(p.value * 100).toFixed(0)}%`}
                            style={{
                              width: `${p.value * 100}%`,
                              backgroundColor: p.color,
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              color: 'white',
                              fontWeight: 600,
                              overflow: 'hidden',
                            }}
                          >
                            {p.value >= 0.15 ? `${(p.value * 100).toFixed(0)}%` : ''}
                          </div>
                        ))}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3">
                        {probs.map(p => (
                            <span key={p.label} className="text-xs text-muted-foreground">
                            <span style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: p.color,
                              marginRight: '0.25rem',
                            }} />
                            {p.label}
                          </span>
                        ))}
                        </div>
                      </td>
                      <td className={tdCn}>
                      <span style={{
                        padding: '0.2rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: `${statusColors[r.actualStatus]}20`,
                        color: statusColors[r.actualStatus],
                      }}>
                        {r.actualStatus}
                      </span>
                    </td>
                      <td className={tdCn}>
                      <span style={{
                        fontSize: '1rem',
                        color: isMatch ? '#38a169' : '#e53e3e',
                          fontWeight: 700,
                      }}>
                        {isMatch ? 'Yes' : 'No'}
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
          <h2 className="mb-4 border-l-4 border-warning pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
          Safehouse Incident Forecast
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
          Monthly incident volume predictions per safehouse using a Random Forest model.
          Forecasts help inform staffing decisions and proactive safety measures.
          </p>
          <div className="mb-4 flex flex-col gap-2 rounded-lg border bg-card p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold uppercase tracking-wide text-muted-foreground">Legend</span>
              <span className="text-muted-foreground/70">•</span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: '#dd6b20' }} />
                Predicted incidents &gt; 0
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: '#e2e8f0' }} />
                0 predicted incidents
              </span>
            </div>
            <div className="text-muted-foreground/80">
              Scale: mini-bars are <strong>relative to each safehouse’s peak</strong>. Units shown as <strong>predicted incidents/month</strong>.
            </div>
          </div>
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {forecasts.map(f => {
            const isFlagged = f.maxPredicted > 0;
            const monthlyData = safehouseIncidentForecasts.filter(d => d.safehouseId === f.safehouseId);
            return (
                <div
                  key={f.safehouseId}
                  className="min-w-0 min-w-0 rounded-xl border bg-card p-4 sm:p-6 card-shadow"
                  style={{ borderLeft: `4px solid ${isFlagged ? '#dd6b20' : '#38a169'}` }}
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-heading text-lg font-semibold text-card-foreground">
                    Safehouse #{f.safehouseId}
                    </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    backgroundColor: isFlagged ? '#fed7d7' : '#c6f6d5',
                    color: isFlagged ? '#c53030' : '#276749',
                  }}>
                    {isFlagged ? 'Elevated Risk' : 'Low Risk'}
                  </span>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Peak Forecast (incidents/mo)</div>
                      <div style={{ color: isFlagged ? '#dd6b20' : '#38a169' }} className="text-xl font-bold">
                      {f.maxPredicted.toFixed(2)}
                      </div>
                    </div>
                  <div>
                      <div className="text-xs text-muted-foreground">Avg Forecast (incidents/mo)</div>
                      <div className="text-xl font-bold text-foreground">
                      {f.avgPredicted.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-1 text-xs text-muted-foreground">Monthly Forecast Trend</div>
                  <div className="flex h-8 items-end gap-0.5">
                  {monthlyData.map((m, idx) => {
                    const barHeight = Math.max(2, (m.predictedNextMonth / Math.max(f.maxPredicted, 0.01)) * 30);
                    return (
                      <div
                        key={idx}
                        title={`${m.monthStart}: ${m.predictedNextMonth.toFixed(3)}`}
                        style={{
                          flex: 1,
                          height: `${barHeight}px`,
                          backgroundColor: m.predictedNextMonth > 0 ? '#dd6b20' : '#e2e8f0',
                          borderRadius: '2px 2px 0 0',
                        }}
                      />
                    );
                  })}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{monthlyData[0]?.monthStart}</span>
                    <span>{monthlyData[monthlyData.length - 1]?.monthStart}</span>
                  </div>
                </div>
            );
          })}
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-info/30 bg-info/10 p-4 sm:p-6">
          <h3 className="mb-2 font-heading text-lg font-semibold text-info">Model Details</h3>
          <p className="m-0 text-sm leading-relaxed text-foreground/80">
          <strong>Reintegration Readiness:</strong> Decision Tree classifier (max depth 5) trained on counseling frequency,
          education progress, health scores, intervention achievement, incident counts, and home visitation outcomes.
          Optimized for precision on "ready" predictions due to safety stakes.
          <br />
          <strong>Incident Forecast:</strong> Random Forest regression (400 trees) with lagged incident counts,
          active residents, education/health metrics, and seasonal features. Time-based train/test split prevents data leakage.
          All predictions are decision-support tools — staff confirmation is always required.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}

const thCn = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap';
const tdCn = 'px-4 py-3 text-foreground align-top';
