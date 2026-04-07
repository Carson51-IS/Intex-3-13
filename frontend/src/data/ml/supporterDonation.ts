export interface SupporterDonationPrediction {
  supporterId: number;
  snapshotDate: string;
  actualDonated: boolean;
  pWillDonate90d: number;
  predictedDonate: boolean;
}

export const supporterDonationPredictions: SupporterDonationPrediction[] = [
  { supporterId: 60, snapshotDate: '2025-05-29', actualDonated: false, pWillDonate90d: 0.2171, predictedDonate: false },
  { supporterId: 54, snapshotDate: '2025-11-23', actualDonated: false, pWillDonate90d: 0.8746, predictedDonate: true },
  { supporterId: 37, snapshotDate: '2025-01-12', actualDonated: false, pWillDonate90d: 0.0385, predictedDonate: false },
  { supporterId: 29, snapshotDate: '2025-10-08', actualDonated: false, pWillDonate90d: 0.0915, predictedDonate: false },
  { supporterId: 17, snapshotDate: '2025-03-15', actualDonated: false, pWillDonate90d: 0.0577, predictedDonate: false },
  { supporterId: 56, snapshotDate: '2025-11-12', actualDonated: true, pWillDonate90d: 0.0876, predictedDonate: false },
  { supporterId: 24, snapshotDate: '2025-10-14', actualDonated: false, pWillDonate90d: 0.2837, predictedDonate: false },
  { supporterId: 53, snapshotDate: '2024-11-09', actualDonated: false, pWillDonate90d: 0.0159, predictedDonate: false },
  { supporterId: 21, snapshotDate: '2025-04-07', actualDonated: false, pWillDonate90d: 0.0735, predictedDonate: false },
  { supporterId: 7, snapshotDate: '2025-11-24', actualDonated: true, pWillDonate90d: 0.8418, predictedDonate: true },
  { supporterId: 50, snapshotDate: '2025-07-08', actualDonated: false, pWillDonate90d: 0.0759, predictedDonate: false },
  { supporterId: 42, snapshotDate: '2025-11-08', actualDonated: true, pWillDonate90d: 0.0459, predictedDonate: false },
  { supporterId: 10, snapshotDate: '2025-11-09', actualDonated: false, pWillDonate90d: 0.0741, predictedDonate: false },
  { supporterId: 30, snapshotDate: '2025-07-29', actualDonated: false, pWillDonate90d: 0.0962, predictedDonate: false },
  { supporterId: 13, snapshotDate: '2025-04-07', actualDonated: false, pWillDonate90d: 0.0796, predictedDonate: false },
];

export function getDonationLikelihood(p: number): 'High' | 'Medium' | 'Low' {
  if (p >= 0.5) return 'High';
  if (p >= 0.2) return 'Medium';
  return 'Low';
}
