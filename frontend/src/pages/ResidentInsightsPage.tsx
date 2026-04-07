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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Link
        to="/admin/insights"
        style={{ display: 'inline-block', marginBottom: '1rem', color: '#2b6cb0', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
      >
        ← Back to ML-Powered Insights
      </Link>
      <h1 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '0.5rem' }}>Resident Care Intelligence</h1>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>
        ML-powered resident analytics: reintegration readiness assessment and safehouse incident forecasting
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            borderTop: `4px solid ${statusColors[status] ?? '#718096'}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: statusColors[status] ?? '#718096' }}>{count}</div>
            <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>Predicted {status}</div>
          </div>
        ))}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          borderTop: `4px solid ${flaggedSafehouses.length > 0 ? '#dd6b20' : '#38a169'}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: flaggedSafehouses.length > 0 ? '#dd6b20' : '#38a169' }}>
            {flaggedSafehouses.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>Safehouses Flagged</div>
        </div>
      </div>

      {/* Reintegration Readiness */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: '1.3rem',
          color: '#1a365d',
          marginBottom: '1rem',
          paddingLeft: '1rem',
          borderLeft: '4px solid #3182ce',
        }}>
          Reintegration Readiness Assessment
        </h2>
        <p style={{ color: '#4a5568', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Predicts each resident's reintegration readiness status based on counseling sessions, education progress,
          health scores, intervention plans, and behavioral incidents. These predictions support — but never replace — staff decision-making.
        </p>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc' }}>
                <th style={thStyle}>Resident ID</th>
                <th style={thStyle}>Predicted Status</th>
                <th style={thStyle}>Probability Breakdown</th>
                <th style={thStyle}>Actual Status</th>
                <th style={thStyle}>Match</th>
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
                  <tr key={r.residentId} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={tdStyle}>#{r.residentId}</td>
                    <td style={tdStyle}>
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
                    <td style={{ ...tdStyle, minWidth: '250px' }}>
                      {/* Stacked probability bar */}
                      <div style={{
                        display: 'flex',
                        height: '20px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        backgroundColor: '#e2e8f0',
                      }}>
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
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        {probs.map(p => (
                          <span key={p.label} style={{ fontSize: '0.7rem', color: '#718096' }}>
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
                    <td style={tdStyle}>
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
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '1.1rem',
                        color: isMatch ? '#38a169' : '#e53e3e',
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

      {/* Safehouse Incident Forecast */}
      <section>
        <h2 style={{
          fontSize: '1.3rem',
          color: '#1a365d',
          marginBottom: '1rem',
          paddingLeft: '1rem',
          borderLeft: '4px solid #dd6b20',
        }}>
          Safehouse Incident Forecast
        </h2>
        <p style={{ color: '#4a5568', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Monthly incident volume predictions per safehouse using a Random Forest model.
          Forecasts help inform staffing decisions and proactive safety measures.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {forecasts.map(f => {
            const isFlagged = f.maxPredicted > 0;
            const monthlyData = safehouseIncidentForecasts.filter(d => d.safehouseId === f.safehouseId);
            return (
              <div key={f.safehouseId} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: `1px solid ${isFlagged ? '#fed7d7' : '#e2e8f0'}`,
                borderLeft: `4px solid ${isFlagged ? '#dd6b20' : '#38a169'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#2d3748', margin: 0 }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>Peak Forecast</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isFlagged ? '#dd6b20' : '#38a169' }}>
                      {f.maxPredicted.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>Avg Forecast</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2d3748' }}>
                      {f.avgPredicted.toFixed(3)}
                    </div>
                  </div>
                </div>

                {/* Mini trend bar */}
                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.35rem' }}>Monthly Forecast Trend</div>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '32px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#a0aec0', marginTop: '0.15rem' }}>
                  <span>{monthlyData[0]?.monthStart}</span>
                  <span>{monthlyData[monthlyData.length - 1]?.monthStart}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Methodology Note */}
      <section style={{
        marginTop: '2.5rem',
        backgroundColor: '#ebf8ff',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #bee3f8',
      }}>
        <h3 style={{ fontSize: '1rem', color: '#2b6cb0', margin: '0 0 0.5rem' }}>Model Details</h3>
        <p style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: 1.7, margin: 0 }}>
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

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontWeight: 600,
  color: '#4a5568',
  borderBottom: '2px solid #e2e8f0',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.65rem 1rem',
  borderBottom: '1px solid #e2e8f0',
  color: '#2d3748',
};
