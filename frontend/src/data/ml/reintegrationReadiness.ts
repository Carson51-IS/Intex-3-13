export interface ReintegrationPrediction {
  residentId: number;
  actualStatus: string;
  predictedStatus: string;
  pCompleted: number;
  pInProgress: number;
  pNotStarted: number;
  pOnHold: number;
}

export const reintegrationPredictions: ReintegrationPrediction[] = [
  { residentId: 49, actualStatus: 'Completed', predictedStatus: 'Completed', pCompleted: 0.6296, pInProgress: 0.3704, pNotStarted: 0, pOnHold: 0 },
  { residentId: 57, actualStatus: 'On Hold', predictedStatus: 'On Hold', pCompleted: 0, pInProgress: 0, pNotStarted: 0, pOnHold: 1 },
  { residentId: 6, actualStatus: 'In Progress', predictedStatus: 'Completed', pCompleted: 0.7461, pInProgress: 0.094, pNotStarted: 0, pOnHold: 0.1599 },
  { residentId: 35, actualStatus: 'In Progress', predictedStatus: 'Completed', pCompleted: 0.6296, pInProgress: 0.3704, pNotStarted: 0, pOnHold: 0 },
  { residentId: 8, actualStatus: 'Not Started', predictedStatus: 'On Hold', pCompleted: 0, pInProgress: 0, pNotStarted: 0, pOnHold: 1 },
  { residentId: 20, actualStatus: 'Completed', predictedStatus: 'Completed', pCompleted: 0.7461, pInProgress: 0.094, pNotStarted: 0, pOnHold: 0.1599 },
  { residentId: 40, actualStatus: 'On Hold', predictedStatus: 'Not Started', pCompleted: 0, pInProgress: 0, pNotStarted: 1, pOnHold: 0 },
  { residentId: 29, actualStatus: 'Completed', predictedStatus: 'Completed', pCompleted: 0.7461, pInProgress: 0.094, pNotStarted: 0, pOnHold: 0.1599 },
  { residentId: 1, actualStatus: 'In Progress', predictedStatus: 'In Progress', pCompleted: 0, pInProgress: 1, pNotStarted: 0, pOnHold: 0 },
  { residentId: 55, actualStatus: 'In Progress', predictedStatus: 'In Progress', pCompleted: 0, pInProgress: 1, pNotStarted: 0, pOnHold: 0 },
  { residentId: 39, actualStatus: 'On Hold', predictedStatus: 'On Hold', pCompleted: 0.0888, pInProgress: 0.1567, pNotStarted: 0.2219, pOnHold: 0.5326 },
  { residentId: 21, actualStatus: 'Completed', predictedStatus: 'In Progress', pCompleted: 0, pInProgress: 1, pNotStarted: 0, pOnHold: 0 },
];

export const statusColors: Record<string, string> = {
  'Completed': '#38a169',
  'In Progress': '#3182ce',
  'Not Started': '#718096',
  'On Hold': '#dd6b20',
};
