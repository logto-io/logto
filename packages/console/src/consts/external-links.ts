import { buildUrl } from '@/utils/url';

export const discordLink = 'https://discord.gg/UEPaF3j5e6';
export const githubOrgLink = 'https://github.com/logto-io';
export const githubLink = 'https://github.com/logto-io/logto';
export const githubIssuesLink = 'https://github.com/logto-io/logto/issues';
export const contactEmail = 'contact@logto.io';
export const contactEmailLink = `mailto:${contactEmail}`;
export const reservationLink = buildUrl('https://calendly.com/logto/30min', {
  // Note: month format is YYYY-MM
  month: new Date().toISOString().slice(0, 7),
});
export const trustAndSecurityLink = 'https://logto.io/trust-and-security';
export const pricingLink = 'https://logto.io/pricing';

/** Docs link */
export const envTagsFeatureLink = '/docs/recipes/tenant-type';
