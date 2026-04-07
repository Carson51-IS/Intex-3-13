import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { donorChurnPredictions } from '../../data/ml/donorChurn';
import { supporterDonationPredictions } from '../../data/ml/supporterDonation';
import { getLatestForecasts } from '../../data/ml/safehouseIncidents';
import { reintegrationPredictions } from '../../data/ml/reintegrationReadiness';

export default function InsightsHubPage() {
  const atRiskDonors = donorChurnPredictions.filter((d) => d.pIsLapsed >= 0.5).length;
  const likelyDonors = supporterDonationPredictions.filter((d) => d.pWillDonate90d >= 0.5).length;
  const flaggedSafehouses = getLatestForecasts().filter((f) => f.maxPredicted > 0).length;
  const readyResidents = reintegrationPredictions.filter((r) => r.predictedStatus === 'Completed').length;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">ML-Powered Insights</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Centralized access to all predictive analytics for donors and residents.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <InsightLinkCard
            title="Donor Intelligence"
            description="Churn risk detection and 90-day donation forecasting."
            stat={`${atRiskDonors} at risk`}
            subStat={`${likelyDonors} likely donors`}
            to="/admin/donor-insights"
            borderAccent="border-destructive"
          />
          <InsightLinkCard
            title="Resident Care Intelligence"
            description="Reintegration readiness and safehouse incident forecasting."
            stat={`${readyResidents} predicted ready`}
            subStat={`${flaggedSafehouses} safehouses flagged`}
            to="/admin/resident-insights"
            borderAccent="border-warning"
          />
          <InsightLinkCard
            title="Social Media Insights"
            description="Best posting windows, engagement strategy, and donation impact analysis."
            stat="Engagement strategy"
            subStat="Donation impact forecasting"
            to="/admin/social-insights"
            borderAccent="border-info"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function InsightLinkCard({
  title,
  description,
  stat,
  subStat,
  to,
  borderAccent,
}: {
  title: string;
  description: string;
  stat: string;
  subStat: string;
  to: string;
  borderAccent: string;
}) {
  return (
    <Link to={to} className="no-underline">
      <div className={`rounded-xl border border-l-4 bg-card p-5 card-shadow transition-shadow hover:card-shadow-hover ${borderAccent}`}>
        <h2 className="font-heading text-xl font-semibold text-card-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 space-y-1 text-sm">
          <p className="font-semibold text-foreground">{stat}</p>
          <p className="text-muted-foreground">{subStat}</p>
        </div>
        <div className="mt-4 text-sm font-semibold text-primary">Open insights →</div>
      </div>
    </Link>
  );
}
