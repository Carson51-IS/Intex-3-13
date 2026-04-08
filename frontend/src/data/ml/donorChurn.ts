export interface DonorChurnPrediction {
  supporterId: number;
  snapshotDate: string;
  isLapsed: boolean;
  pIsLapsed: number;
  predictedLapsed: boolean;
}

export const donorChurnPredictions: DonorChurnPrediction[] = [
  { supporterId: 35, snapshotDate: '2025-08-28', isLapsed: false, pIsLapsed: 0.4638, predictedLapsed: false },
  { supporterId: 52, snapshotDate: '2024-09-17', isLapsed: true, pIsLapsed: 0.6237, predictedLapsed: true },
  { supporterId: 38, snapshotDate: '2024-12-06', isLapsed: true, pIsLapsed: 0.6005, predictedLapsed: true },
  { supporterId: 43, snapshotDate: '2025-01-12', isLapsed: true, pIsLapsed: 0.6921, predictedLapsed: true },
  { supporterId: 21, snapshotDate: '2025-04-07', isLapsed: true, pIsLapsed: 0.6547, predictedLapsed: true },
  { supporterId: 11, snapshotDate: '2025-08-21', isLapsed: false, pIsLapsed: 0.4745, predictedLapsed: false },
  { supporterId: 2, snapshotDate: '2025-05-08', isLapsed: true, pIsLapsed: 0.6267, predictedLapsed: true },
  { supporterId: 25, snapshotDate: '2025-08-30', isLapsed: false, pIsLapsed: 0.3991, predictedLapsed: false },
  { supporterId: 41, snapshotDate: '2025-01-23', isLapsed: true, pIsLapsed: 0.6596, predictedLapsed: true },
  { supporterId: 44, snapshotDate: '2024-07-21', isLapsed: true, pIsLapsed: 0.7098, predictedLapsed: true },
  { supporterId: 37, snapshotDate: '2025-01-12', isLapsed: true, pIsLapsed: 0.6246, predictedLapsed: true },
  { supporterId: 12, snapshotDate: '2025-08-24', isLapsed: false, pIsLapsed: 0.4564, predictedLapsed: false },
];

export function getChurnRiskLevel(p: number): 'High' | 'Medium' | 'Low' {
  if (p >= 0.6) return 'High';
  if (p >= 0.45) return 'Medium';
  return 'Low';
}
