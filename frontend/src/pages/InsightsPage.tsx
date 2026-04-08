import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen overflow-x-hidden bg-background">
      <section className="hero-gradient px-4 py-14 text-center text-primary-foreground sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold md:text-5xl">Social Media Insights</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
          Data-driven recommendations for maximizing engagement and donation impact across platforms.
        </p>
      </section>

      <div className="mx-auto min-w-0 w-full max-w-6xl overflow-x-hidden break-words px-4 pb-12 pt-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/admin/insights"
            className="shrink-0 text-sm font-semibold text-primary no-underline hover:underline"
          >
            ← Back to ML-Powered Insights
          </Link>
          <div className="inline-flex w-full shrink-0 flex-wrap self-end rounded-lg border border-border bg-card p-1 card-shadow sm:w-auto sm:flex-nowrap sm:self-auto">
          {[
            { key: 'engagement' as Tab, label: 'Engagement Strategy' },
            { key: 'donations' as Tab, label: 'Donation Impact' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-4 ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        {activeTab === 'engagement' ? (
          <>
            <section className="mt-4">
              <h2 className="mb-4 border-l-4 border-primary pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
                Best Posting Windows by Platform
              </h2>
              <p className="mb-6 text-sm text-muted-foreground md:text-base">
                Our ML model analyzed historical post performance to identify the optimal times for high engagement on each platform.
              </p>
              <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                {topEngagementByPlatform.map(({ platform, best, count }) => (
                  <div key={platform} className="min-w-0 min-w-0 rounded-xl border bg-card p-4 sm:p-5 card-shadow" style={{ borderTop: `4px solid ${platformColors[platform] ?? '#718096'}` }}>
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-heading text-xl font-semibold text-card-foreground">{platform}</h3>
                      <span className="max-w-full rounded-full bg-info/15 px-2 py-1 text-xs font-semibold text-info">
                        {count} windows
                      </span>
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Best Time</div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {best.dayOfWeek} at {formatHour(best.postHour)}
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Engagement Probability</span>
                        <span className="font-semibold text-foreground">{(best.pHighEngagement * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-muted">
                        <div style={{
                          height: '100%',
                          width: `${best.pHighEngagement * 100}%`,
                          backgroundColor: platformColors[platform] ?? '#718096',
                          borderRadius: '999px',
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Full Table */}
            <section className="mt-10">
              <h2 className="mb-4 border-l-4 border-primary pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
                All Recommended Posting Windows
              </h2>
              <div className="-mx-1 overflow-x-auto min-w-0 rounded-xl border bg-card card-shadow sm:mx-0">
                <table className="min-w-[680px] w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className={thCn}>Rank</th>
                      <th className={thCn}>Platform</th>
                      <th className={thCn}>Day</th>
                      <th className={thCn}>Time</th>
                      <th className={thCn}>Engagement Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagementWindows.map((w, i) => (
                      <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                        <td className={tdCn}>#{i + 1}</td>
                        <td className={tdCn}>
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
                        <td className={tdCn}>{w.dayOfWeek}</td>
                        <td className={tdCn}>{formatHour(w.postHour)}</td>
                        <td className={tdCn}>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-28 overflow-hidden rounded bg-muted">
                              <div style={{
                                height: '100%',
                                width: `${w.pHighEngagement * 100}%`,
                                backgroundColor: w.pHighEngagement > 0.6 ? '#38a169' : w.pHighEngagement > 0.55 ? '#d69e2e' : '#4299e1',
                                borderRadius: '999px',
                              }} />
                            </div>
                            <span className="min-w-10 font-semibold">{(w.pHighEngagement * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Day of Week Summary */}
            <section className="mt-10">
              <h2 className="mb-4 border-l-4 border-primary pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
                Engagement by Day of Week
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                {dayOrder.map(day => {
                  const dayWindows = engagementWindows.filter(w => w.dayOfWeek === day);
                  const avgProb = dayWindows.length > 0
                    ? dayWindows.reduce((s, w) => s + w.pHighEngagement, 0) / dayWindows.length
                    : 0;
                  return (
                    <div key={day} className="min-w-0 rounded-xl border bg-card p-4 text-center card-shadow">
                      <div className="mb-1 text-xs text-muted-foreground">
                        {day.slice(0, 3)}
                      </div>
                      <div className="text-2xl font-bold" style={{ color: avgProb > 0.58 ? '#38a169' : '#2b6cb0' }}>
                        {dayWindows.length}
                      </div>
                      <div className="text-xs text-muted-foreground">windows</div>
                      {dayWindows.length > 0 && (
                        <div className="mt-1 text-sm font-semibold text-foreground">
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
            <section className="mt-4">
              <h2 className="mb-4 border-l-4 border-success pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
                Highest Donation Impact by Platform
              </h2>
              <p className="mb-6 text-sm text-muted-foreground md:text-base">
                Our ML model predicts expected donation value attributable to social media posts, helping optimize posting strategy for fundraising.
              </p>
              <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                {topDonationByPlatform.map(({ platform, best, count }) => (
                  <div key={platform} className="min-w-0 min-w-0 rounded-xl border bg-card p-4 sm:p-5 card-shadow" style={{ borderTop: `4px solid ${platformColors[platform] ?? '#718096'}` }}>
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-heading text-xl font-semibold text-card-foreground">{platform}</h3>
                      <span className="max-w-full rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                        {count} windows
                      </span>
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Best Time</div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {best.dayOfWeek} at {formatHour(best.postHour)}
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Predicted Donation Value</div>
                      <div className="mt-1 text-2xl font-bold text-success sm:text-3xl">
                        {formatPhp(best.predictedDonationValue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 border-l-4 border-success pl-3 font-heading text-xl font-semibold text-foreground md:text-2xl">
                All Recommended Posting Windows for Donations
              </h2>
              <div className="-mx-1 overflow-x-auto min-w-0 rounded-xl border bg-card card-shadow sm:mx-0">
                <table className="min-w-[680px] w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className={thCn}>Rank</th>
                      <th className={thCn}>Platform</th>
                      <th className={thCn}>Day</th>
                      <th className={thCn}>Time</th>
                      <th className={thCn}>Predicted Value (PHP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationLiftWindows.map((w, i) => (
                      <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                        <td className={tdCn}>#{i + 1}</td>
                        <td className={tdCn}>
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
                        <td className={tdCn}>{w.dayOfWeek}</td>
                        <td className={tdCn}>{formatHour(w.postHour)}</td>
                        <td className={`${tdCn} font-semibold text-success`}>
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

        <section className="mt-10 rounded-xl border border-info/30 bg-info/10 p-4 sm:p-6">
          <h3 className="font-heading text-lg font-semibold text-info">About This Analysis</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
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
const thCn = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const tdCn = 'px-4 py-3 text-foreground';
