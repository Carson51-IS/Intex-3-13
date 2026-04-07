import { useState } from 'react';
import { engagementWindows, platformColors } from '../data/ml/socialEngagement';
import { donationLiftWindows } from '../data/ml/socialDonationLift';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function formatPhp(value: number): string {
  if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
  return `₱${value.toFixed(0)}`;
}

type Tab = 'engagement' | 'donations';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('engagement');

  const engagementPlatforms = [...new Set(engagementWindows.map(w => w.platform))];
  const donationPlatforms = [...new Set(donationLiftWindows.map(w => w.platform))];

  const topEngagementByPlatform = engagementPlatforms.map(platform => {
    const windows = engagementWindows.filter(w => w.platform === platform);
    const best = windows[0];
    return { platform, best, count: windows.length };
  });

  const topDonationByPlatform = donationPlatforms.map(platform => {
    const windows = donationLiftWindows.filter(w => w.platform === platform);
    const best = windows[0];
    return { platform, best, count: windows.length };
  });

  return (
    <div>
      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #4299e1 100%)',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>
          Social Media Insights
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          Data-driven recommendations for maximizing engagement and donation impact across platforms
        </p>
      </section>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1.5rem 2rem 0',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {[
          { key: 'engagement' as Tab, label: 'Engagement Strategy' },
          { key: 'donations' as Tab, label: 'Donation Impact' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              backgroundColor: activeTab === tab.key ? 'white' : '#e2e8f0',
              color: activeTab === tab.key ? '#1a365d' : '#718096',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '3px solid #2b6cb0' : '3px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 3rem' }}>
        {activeTab === 'engagement' ? (
          <>
            {/* Platform Best Times */}
            <section style={{ marginTop: '2rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                color: '#1a365d',
                marginBottom: '1.25rem',
                paddingLeft: '1rem',
                borderLeft: '4px solid #2b6cb0',
              }}>
                Best Posting Windows by Platform
              </h2>
              <p style={{ color: '#4a5568', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Our ML model analyzed historical post performance to identify the optimal times for high engagement on each platform.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {topEngagementByPlatform.map(({ platform, best, count }) => (
                  <div key={platform} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    borderTop: `4px solid ${platformColors[platform] ?? '#718096'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.15rem', color: '#2d3748', margin: 0 }}>{platform}</h3>
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#ebf8ff',
                        color: '#2b6cb0',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}>
                        {count} windows
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>Best Time</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748' }}>
                      {best.dayOfWeek} at {formatHour(best.postHour)}
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem' }}>
                        <span>Engagement Probability</span>
                        <span style={{ fontWeight: 600, color: '#2d3748' }}>{(best.pHighEngagement * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${best.pHighEngagement * 100}%`,
                          backgroundColor: platformColors[platform] ?? '#718096',
                          borderRadius: '4px',
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Full Table */}
            <section style={{ marginTop: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                color: '#1a365d',
                marginBottom: '1.25rem',
                paddingLeft: '1rem',
                borderLeft: '4px solid #2b6cb0',
              }}>
                All Recommended Posting Windows
              </h2>
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
                      <th style={thStyle}>Rank</th>
                      <th style={thStyle}>Platform</th>
                      <th style={thStyle}>Day</th>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Engagement Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagementWindows.map((w, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f7fafc' }}>
                        <td style={tdStyle}>#{i + 1}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: platformColors[w.platform] ?? '#718096',
                            marginRight: '0.5rem',
                          }} />
                          {w.platform}
                        </td>
                        <td style={tdStyle}>{w.dayOfWeek}</td>
                        <td style={tdStyle}>{formatHour(w.postHour)}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              flex: 1,
                              height: '6px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              maxWidth: '120px',
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${w.pHighEngagement * 100}%`,
                                backgroundColor: w.pHighEngagement > 0.6 ? '#38a169' : w.pHighEngagement > 0.55 ? '#d69e2e' : '#4299e1',
                                borderRadius: '3px',
                              }} />
                            </div>
                            <span style={{ fontWeight: 600, minWidth: '40px' }}>{(w.pHighEngagement * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Day of Week Summary */}
            <section style={{ marginTop: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                color: '#1a365d',
                marginBottom: '1.25rem',
                paddingLeft: '1rem',
                borderLeft: '4px solid #2b6cb0',
              }}>
                Engagement by Day of Week
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.75rem',
              }}>
                {dayOrder.map(day => {
                  const dayWindows = engagementWindows.filter(w => w.dayOfWeek === day);
                  const avgProb = dayWindows.length > 0
                    ? dayWindows.reduce((s, w) => s + w.pHighEngagement, 0) / dayWindows.length
                    : 0;
                  return (
                    <div key={day} style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '1rem',
                      textAlign: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.5rem' }}>
                        {day.slice(0, 3)}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: avgProb > 0.58 ? '#38a169' : '#2b6cb0' }}>
                        {dayWindows.length}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>windows</div>
                      {dayWindows.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#4a5568', marginTop: '0.35rem', fontWeight: 600 }}>
                          {(avgProb * 100).toFixed(0)}% avg
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Donation Impact Platform Cards */}
            <section style={{ marginTop: '2rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                color: '#1a365d',
                marginBottom: '1.25rem',
                paddingLeft: '1rem',
                borderLeft: '4px solid #38a169',
              }}>
                Highest Donation Impact by Platform
              </h2>
              <p style={{ color: '#4a5568', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Our ML model predicts expected donation value attributable to social media posts, helping optimize posting strategy for fundraising.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {topDonationByPlatform.map(({ platform, best, count }) => (
                  <div key={platform} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    borderTop: `4px solid ${platformColors[platform] ?? '#718096'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.15rem', color: '#2d3748', margin: 0 }}>{platform}</h3>
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#f0fff4',
                        color: '#38a169',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}>
                        {count} windows
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>Best Time</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748' }}>
                      {best.dayOfWeek} at {formatHour(best.postHour)}
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>Predicted Donation Value</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38a169', marginTop: '0.25rem' }}>
                        {formatPhp(best.predictedDonationValue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Full Donation Table */}
            <section style={{ marginTop: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                color: '#1a365d',
                marginBottom: '1.25rem',
                paddingLeft: '1rem',
                borderLeft: '4px solid #38a169',
              }}>
                All Recommended Posting Windows for Donations
              </h2>
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
                      <th style={thStyle}>Rank</th>
                      <th style={thStyle}>Platform</th>
                      <th style={thStyle}>Day</th>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Predicted Value (PHP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationLiftWindows.map((w, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f7fafc' }}>
                        <td style={tdStyle}>#{i + 1}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: platformColors[w.platform] ?? '#718096',
                            marginRight: '0.5rem',
                          }} />
                          {w.platform}
                        </td>
                        <td style={tdStyle}>{w.dayOfWeek}</td>
                        <td style={tdStyle}>{formatHour(w.postHour)}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#38a169' }}>
                          ₱{w.predictedDonationValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Methodology Note */}
        <section style={{
          marginTop: '2.5rem',
          backgroundColor: '#ebf8ff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #bee3f8',
        }}>
          <h3 style={{ fontSize: '1rem', color: '#2b6cb0', margin: '0 0 0.5rem' }}>About This Analysis</h3>
          <p style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: 1.7, margin: 0 }}>
            These recommendations are generated by machine learning models trained on Haven Light Philippines' historical social media data.
            The engagement model uses a Random Forest classifier to predict high-engagement posts (top 25th percentile),
            while the donation lift model uses Ridge Regression to estimate expected donation value per post.
            Both models use only pre-publish features (platform, timing, content type) so predictions can guide future posting decisions.
          </p>
        </section>
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
};

const tdStyle: React.CSSProperties = {
  padding: '0.65rem 1rem',
  borderBottom: '1px solid #e2e8f0',
  color: '#2d3748',
};
