export interface DonationLiftWindow {
  platform: string;
  dayOfWeek: string;
  postHour: number;
  predictedDonationValue: number;
}

export const donationLiftWindows: DonationLiftWindow[] = [
  { platform: 'Facebook', dayOfWeek: 'Friday', postHour: 8, predictedDonationValue: 397946 },
  { platform: 'LinkedIn', dayOfWeek: 'Friday', postHour: 7, predictedDonationValue: 374425 },
  { platform: 'Instagram', dayOfWeek: 'Wednesday', postHour: 14, predictedDonationValue: 366869 },
  { platform: 'YouTube', dayOfWeek: 'Tuesday', postHour: 1, predictedDonationValue: 257670 },
  { platform: 'Instagram', dayOfWeek: 'Monday', postHour: 11, predictedDonationValue: 256500 },
  { platform: 'Instagram', dayOfWeek: 'Saturday', postHour: 9, predictedDonationValue: 228131 },
  { platform: 'YouTube', dayOfWeek: 'Wednesday', postHour: 12, predictedDonationValue: 221539 },
  { platform: 'Facebook', dayOfWeek: 'Friday', postHour: 4, predictedDonationValue: 203770 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 20, predictedDonationValue: 185371 },
  { platform: 'Facebook', dayOfWeek: 'Friday', postHour: 18, predictedDonationValue: 183210 },
  { platform: 'YouTube', dayOfWeek: 'Sunday', postHour: 13, predictedDonationValue: 174104 },
  { platform: 'Twitter', dayOfWeek: 'Wednesday', postHour: 8, predictedDonationValue: 168076 },
  { platform: 'TikTok', dayOfWeek: 'Friday', postHour: 23, predictedDonationValue: 129422 },
  { platform: 'WhatsApp', dayOfWeek: 'Thursday', postHour: 21, predictedDonationValue: 128885 },
  { platform: 'WhatsApp', dayOfWeek: 'Saturday', postHour: 11, predictedDonationValue: 128197 },
  { platform: 'Facebook', dayOfWeek: 'Sunday', postHour: 11, predictedDonationValue: 126501 },
  { platform: 'WhatsApp', dayOfWeek: 'Monday', postHour: 7, predictedDonationValue: 119367 },
  { platform: 'TikTok', dayOfWeek: 'Sunday', postHour: 19, predictedDonationValue: 109701 },
  { platform: 'TikTok', dayOfWeek: 'Wednesday', postHour: 20, predictedDonationValue: 109309 },
  { platform: 'Instagram', dayOfWeek: 'Friday', postHour: 17, predictedDonationValue: 108778 },
  { platform: 'Instagram', dayOfWeek: 'Tuesday', postHour: 19, predictedDonationValue: 107687 },
  { platform: 'LinkedIn', dayOfWeek: 'Saturday', postHour: 9, predictedDonationValue: 107154 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 10, predictedDonationValue: 107032 },
  { platform: 'TikTok', dayOfWeek: 'Saturday', postHour: 21, predictedDonationValue: 106129 },
  { platform: 'Facebook', dayOfWeek: 'Monday', postHour: 18, predictedDonationValue: 99924 },
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
