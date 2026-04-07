import { useState } from 'react';
import { donorChurnPredictions, getChurnRiskLevel } from '../data/ml/donorChurn';
import { supporterDonationPredictions, getDonationLikelihood } from '../data/ml/supporterDonation';

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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '0.5rem' }}>Donor Intelligence</h1>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>
        ML-powered donor analytics: churn risk detection and donation likelihood forecasting
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
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

      {/* Churn Risk Table */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: '1.3rem',
          color: '#1a365d',
          marginBottom: '1rem',
          paddingLeft: '1rem',
          borderLeft: '4px solid #c53030',
        }}>
          Donor Churn Risk
        </h2>
        <p style={{ color: '#4a5568', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Identifies donors at risk of lapsing (no donation within 6 months). Higher probability means higher risk of losing the donor.
          Proactive outreach to high-risk donors can significantly improve retention.
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
                <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort(churnSort, 'id', setChurnSort)}>
                  Supporter ID{sortIndicator(churnSort, 'id')}
                </th>
                <th style={thStyle}>Snapshot Date</th>
                <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort(churnSort, 'probability', setChurnSort)}>
                  Churn Probability{sortIndicator(churnSort, 'probability')}
                </th>
                <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort(churnSort, 'risk', setChurnSort)}>
                  Risk Level{sortIndicator(churnSort, 'risk')}
                </th>
                <th style={thStyle}>Actual Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedChurn.map((d, i) => {
                const risk = getChurnRiskLevel(d.pIsLapsed);
                const colors = riskColors[risk];
                return (
                  <tr key={d.supporterId} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={tdStyle}>#{d.supporterId}</td>
                    <td style={tdStyle}>{d.snapshotDate}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        <span style={{ fontWeight: 600, minWidth: '42px' }}>{(d.pIsLapsed * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
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
                    <td style={tdStyle}>
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

      {/* Donation Forecast Table */}
      <section>
        <h2 style={{
          fontSize: '1.3rem',
          color: '#1a365d',
          marginBottom: '1rem',
          paddingLeft: '1rem',
          borderLeft: '4px solid #38a169',
        }}>
          90-Day Donation Forecast
        </h2>
        <p style={{ color: '#4a5568', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Predicts which supporters are most likely to donate within the next 90 days.
          Use this to prioritize engagement outreach and personalize communications.
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
                <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort(donationSort, 'id', setDonationSort)}>
                  Supporter ID{sortIndicator(donationSort, 'id')}
                </th>
                <th style={thStyle}>Snapshot Date</th>
                <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort(donationSort, 'probability', setDonationSort)}>
                  Donation Probability{sortIndicator(donationSort, 'probability')}
                </th>
                <th style={thStyle}>Likelihood</th>
                <th style={thStyle}>Actual</th>
              </tr>
            </thead>
            <tbody>
              {sortedDonation.map((d, i) => {
                const likelihood = getDonationLikelihood(d.pWillDonate90d);
                const colors = riskColors[likelihood === 'High' ? 'Low' : likelihood === 'Low' ? 'High' : 'Medium'];
                return (
                  <tr key={d.supporterId} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={tdStyle}>#{d.supporterId}</td>
                    <td style={tdStyle}>{d.snapshotDate}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        <span style={{ fontWeight: 600, minWidth: '42px' }}>{(d.pWillDonate90d * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
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
                    <td style={tdStyle}>
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
          <strong>Donor Churn:</strong> Logistic Regression & Random Forest models trained on donation history features
          (recency, frequency, tenure, donation mix). Uses temporal snapshots to prevent data leakage. Threshold: 50%.
          <br />
          <strong>90-Day Forecast:</strong> Logistic Regression with balanced class weights, trained on donation patterns
          and supporter demographics. Predictions are decision-support tools — always combine with staff judgment.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, subtitle, color, bgColor }: {
  label: string; value: string; subtitle: string; color: string; bgColor: string;
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{
        fontSize: '0.8rem',
        color: '#a0aec0',
        marginTop: '0.5rem',
        backgroundColor: bgColor,
        display: 'inline-block',
        padding: '0.15rem 0.5rem',
        borderRadius: '8px',
      }}>
        {subtitle}
      </div>
    </div>
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
