import { buildUrl } from '@/utils/url';

export const reservationLink = buildUrl('https://calendly.com/logto/30min', {
  // Note: month format is YYYY-MM
  month: new Date().toISOString().slice(0, 7),
});
export const emailUsLink = buildUrl('mailto:contact@logto.io', {
  subject: 'Cloud pricing and special offer',
}).replace(/\+/g, '%20');

export const logtoBlogLink = 'https://docs.logto.io/blog?utm_source=console';
export const aboutCloudPreviewLink = 'https://docs.logto.io/about/cloud-preview?utm_source=console';
