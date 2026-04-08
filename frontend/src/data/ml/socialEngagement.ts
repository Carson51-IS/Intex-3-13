export interface EngagementWindow {
  platform: string;
  dayOfWeek: string;
  postHour: number;
  pHighEngagement: number;
}

export const engagementWindows: EngagementWindow[] = [
  { platform: 'YouTube', dayOfWeek: 'Wednesday', postHour: 9, pHighEngagement: 0.7356 },
  { platform: 'TikTok', dayOfWeek: 'Wednesday', postHour: 20, pHighEngagement: 0.7197 },
  { platform: 'YouTube', dayOfWeek: 'Saturday', postHour: 15, pHighEngagement: 0.6778 },
  { platform: 'YouTube', dayOfWeek: 'Monday', postHour: 17, pHighEngagement: 0.6502 },
  { platform: 'TikTok', dayOfWeek: 'Saturday', postHour: 21, pHighEngagement: 0.6246 },
  { platform: 'LinkedIn', dayOfWeek: 'Saturday', postHour: 20, pHighEngagement: 0.624 },
  { platform: 'Instagram', dayOfWeek: 'Friday', postHour: 15, pHighEngagement: 0.623 },
  { platform: 'Facebook', dayOfWeek: 'Sunday', postHour: 10, pHighEngagement: 0.6209 },
  { platform: 'YouTube', dayOfWeek: 'Saturday', postHour: 11, pHighEngagement: 0.6194 },
  { platform: 'WhatsApp', dayOfWeek: 'Thursday', postHour: 21, pHighEngagement: 0.6182 },
  { platform: 'Twitter', dayOfWeek: 'Sunday', postHour: 16, pHighEngagement: 0.6179 },
  { platform: 'Facebook', dayOfWeek: 'Monday', postHour: 13, pHighEngagement: 0.6001 },
  { platform: 'TikTok', dayOfWeek: 'Sunday', postHour: 19, pHighEngagement: 0.592 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 18, pHighEngagement: 0.5902 },
  { platform: 'Instagram', dayOfWeek: 'Saturday', postHour: 19, pHighEngagement: 0.5736 },
  { platform: 'Facebook', dayOfWeek: 'Tuesday', postHour: 19, pHighEngagement: 0.5723 },
  { platform: 'Instagram', dayOfWeek: 'Monday', postHour: 11, pHighEngagement: 0.5681 },
  { platform: 'Instagram', dayOfWeek: 'Wednesday', postHour: 15, pHighEngagement: 0.5644 },
  { platform: 'Twitter', dayOfWeek: 'Sunday', postHour: 19, pHighEngagement: 0.5631 },
  { platform: 'Instagram', dayOfWeek: 'Friday', postHour: 17, pHighEngagement: 0.5621 },
  { platform: 'TikTok', dayOfWeek: 'Friday', postHour: 23, pHighEngagement: 0.5591 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 19, pHighEngagement: 0.5586 },
  { platform: 'TikTok', dayOfWeek: 'Thursday', postHour: 11, pHighEngagement: 0.5573 },
  { platform: 'Twitter', dayOfWeek: 'Friday', postHour: 23, pHighEngagement: 0.5482 },
  { platform: 'Twitter', dayOfWeek: 'Saturday', postHour: 9, pHighEngagement: 0.5471 },
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
