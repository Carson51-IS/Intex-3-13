export interface DonationLiftWindow {
  platform: string;
  dayOfWeek: string;
  postHour: number;
  predictedDonationValue: number;
}

export const donationLiftWindows: DonationLiftWindow[] = [
  { platform: 'Facebook', dayOfWeek: 'Friday', postHour: 8, predictedDonationValue: 406916 },
  { platform: 'LinkedIn', dayOfWeek: 'Friday', postHour: 7, predictedDonationValue: 377256 },
  { platform: 'Instagram', dayOfWeek: 'Wednesday', postHour: 14, predictedDonationValue: 364720 },
  { platform: 'Instagram', dayOfWeek: 'Monday', postHour: 11, predictedDonationValue: 255840 },
  { platform: 'YouTube', dayOfWeek: 'Tuesday', postHour: 1, predictedDonationValue: 254718 },
  { platform: 'Instagram', dayOfWeek: 'Saturday', postHour: 9, predictedDonationValue: 227936 },
  { platform: 'YouTube', dayOfWeek: 'Wednesday', postHour: 12, predictedDonationValue: 220767 },
  { platform: 'Facebook', dayOfWeek: 'Friday', postHour: 4, predictedDonationValue: 200943 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 20, predictedDonationValue: 182403 },
  { platform: 'Facebook', dayOfWeek: 'Friday', postHour: 18, predictedDonationValue: 179032 },
  { platform: 'YouTube', dayOfWeek: 'Sunday', postHour: 13, predictedDonationValue: 175983 },
  { platform: 'Twitter', dayOfWeek: 'Wednesday', postHour: 8, predictedDonationValue: 168170 },
  { platform: 'WhatsApp', dayOfWeek: 'Saturday', postHour: 11, predictedDonationValue: 129987 },
  { platform: 'TikTok', dayOfWeek: 'Friday', postHour: 23, predictedDonationValue: 129266 },
  { platform: 'WhatsApp', dayOfWeek: 'Thursday', postHour: 21, predictedDonationValue: 128920 },
  { platform: 'Facebook', dayOfWeek: 'Sunday', postHour: 11, predictedDonationValue: 126245 },
  { platform: 'WhatsApp', dayOfWeek: 'Monday', postHour: 7, predictedDonationValue: 119939 },
  { platform: 'TikTok', dayOfWeek: 'Sunday', postHour: 19, predictedDonationValue: 109701 },
  { platform: 'Instagram', dayOfWeek: 'Friday', postHour: 17, predictedDonationValue: 108773 },
  { platform: 'Instagram', dayOfWeek: 'Tuesday', postHour: 19, predictedDonationValue: 107687 },
  { platform: 'TikTok', dayOfWeek: 'Wednesday', postHour: 20, predictedDonationValue: 107107 },
  { platform: 'Facebook', dayOfWeek: 'Saturday', postHour: 10, predictedDonationValue: 106983 },
  { platform: 'LinkedIn', dayOfWeek: 'Saturday', postHour: 9, predictedDonationValue: 106975 },
  { platform: 'TikTok', dayOfWeek: 'Saturday', postHour: 21, predictedDonationValue: 106128 },
  { platform: 'Facebook', dayOfWeek: 'Monday', postHour: 18, predictedDonationValue: 100702 },
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
