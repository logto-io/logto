import { contactEmailLink } from '@/consts';
import { buildUrl } from '@/utils/url';

export const reservationLink = buildUrl('https://calendly.com/logto/30min', {
  // Note: month format is YYYY-MM
  month: new Date().toISOString().slice(0, 7),
});
export const emailUsLink = buildUrl(contactEmailLink, {
  subject: 'Cloud pricing and special offer',
}).replaceAll('+', '%20');

export const aboutCloudPreviewLink = 'https://docs.logto.io/about/cloud-preview?utm_source=console';
