export interface EngagementWindow {
  platform: string;
  dayOfWeek: string;
  postHour: number;
  pHighEngagement: number;
}

export const engagementWindows: EngagementWindow[] = [
  { platform: 'YouTube', dayOfWeek: 'Wednesday', postHour: 9, pHighEngagement: 0.7376 },
  { platform: 'TikTok', dayOfWeek: 'Wednesday', postHour: 20, pHighEngagement: 0.7193 },
  { platform: 'YouTube', dayOfWeek: 'Saturday', postHour: 15, pHighEngagement: 0.6628 },
  { platform: 'YouTube', dayOfWeek: 'Monday', postHour: 17, pHighEngagement: 0.6549 },
  { platform: 'TikTok', dayOfWeek: 'Saturday', postHour: 21, pHighEngagement: 0.6356 },
  { platform: 'YouTube', dayOfWeek: 'Saturday', postHour: 11, pHighEngagement: 0.6292 },
  { platform: 'Twitter', dayOfWeek: 'Sunday', postHour: 16, pHighEngagement: 0.6281 },
  { platform: 'LinkedIn', dayOfWeek: 'Saturday', postHour: 20, pHighEngagement: 0.6253 },
  { platform: 'Facebook', dayOfWeek: 'Sunday', postHour: 10, pHighEngagement: 0.6216 },
  { platform: 'Instagram', dayOfWeek: 'Friday', postHour: 15, pHighEngagement: 0.6204 },
  { platform: 'WhatsApp', dayOfWeek: 'Thursday', postHour: 21, pHighEngagement: 0.6101 },
  { platform: 'Facebook', dayOfWeek: 'Monday', postHour: 13, pHighEngagement: 0.6099 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 18, pHighEngagement: 0.5980 },
  { platform: 'TikTok', dayOfWeek: 'Sunday', postHour: 19, pHighEngagement: 0.5944 },
  { platform: 'Instagram', dayOfWeek: 'Saturday', postHour: 19, pHighEngagement: 0.5781 },
  { platform: 'Facebook', dayOfWeek: 'Tuesday', postHour: 19, pHighEngagement: 0.5733 },
  { platform: 'Instagram', dayOfWeek: 'Wednesday', postHour: 15, pHighEngagement: 0.5662 },
  { platform: 'Twitter', dayOfWeek: 'Sunday', postHour: 19, pHighEngagement: 0.5640 },
  { platform: 'Instagram', dayOfWeek: 'Monday', postHour: 11, pHighEngagement: 0.5619 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 19, pHighEngagement: 0.5589 },
  { platform: 'Instagram', dayOfWeek: 'Friday', postHour: 17, pHighEngagement: 0.5587 },
  { platform: 'TikTok', dayOfWeek: 'Thursday', postHour: 11, pHighEngagement: 0.5559 },
  { platform: 'TikTok', dayOfWeek: 'Friday', postHour: 23, pHighEngagement: 0.5468 },
  { platform: 'Twitter', dayOfWeek: 'Saturday', postHour: 9, pHighEngagement: 0.5466 },
  { platform: 'YouTube', dayOfWeek: 'Sunday', postHour: 14, pHighEngagement: 0.5436 },
];

export const platformColors: Record<string, string> = {
  Facebook: '#1877F2',
  Instagram: '#E4405F',
  Twitter: '#1DA1F2',
  TikTok: '#000000',
  YouTube: '#FF0000',
  LinkedIn: '#0A66C2',
  WhatsApp: '#25D366',
};
