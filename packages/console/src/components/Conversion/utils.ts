import { isProduction } from '@/consts/env';

export const gtagAwTrackingId = 'AW-11124811245';
export enum GtagConversionId {
  /** This ID indicates a user has truly signed up for Logto Cloud. */
  SignUp = 'AW-11192640559/ZuqUCLvNpasYEK_IiNkp',
  /** This ID indicates a user has created a production tenant. */
  CreateProductionTenant = 'AW-11192640559/m04fCMDrxI0ZEK_IiNkp',
}

export const redditPixelId = 't2_ggt11omdo';

const logtoProductionHostname = 'logto.io';

/**
 * Due to the special of conversion reporting, it should be `true` only in the
 * Logto Cloud production environment.
 * Add the leading '.' to make it safer (ignore hostnames like "foologto.io").
 */
export const shouldReport = window.location.hostname.endsWith('.' + logtoProductionHostname);

/**
 * This function will do the following things:
 *
 * 1. Canonicalize the given email by Reddit's rule: lowercase, trim,
 * remove dots, remove everything after the first '+'.
 * 2. Hash the canonicalized email by SHA256.
 */
export const hashEmail = async (email?: string) => {
  if (!email) {
    return;
  }

  const splitEmail = email.toLocaleLowerCase().trim().split('@');
  const [localPart, domain] = splitEmail;

  if (!localPart || !domain || splitEmail.length > 2) {
    return;
  }

  // eslint-disable-next-line unicorn/prefer-string-replace-all
  const canonicalizedEmail = `${localPart.replace(/\./g, '').replace(/\+.*/, '')}@${domain}`;
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalizedEmail));

  // https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
  return [...new Uint8Array(hash)].map((value) => value.toString(16).padStart(2, '0')).join('');
};

/** Print debug message if not in production. */
const debug = (...args: Parameters<(typeof console)['debug']>) => {
  if (!isProduction) {
    console.debug(...args);
  }
};

/**
 * Add more if needed: https://reddit.my.site.com/helpcenter/s/article/Install-the-Reddit-Pixel-on-your-website
 */
export type RedditReportType =
  | 'PageVisit'
  | 'ViewContent'
  | 'Search'
  | 'Purchase'
  | 'Lead'
  | 'SignUp';

export const reportToReddit = (redditType: RedditReportType) => {
  if (!window.rdt) {
    return false;
  }

  debug('report:', 'redditType =', redditType);
  window.rdt('track', redditType);

  return true;
};

export const reportToGoogle = (gtagId: GtagConversionId, rest: Record<string, unknown> = {}) => {
  if (!window.gtag) {
    return false;
  }

  debug('report:', 'gtagId =', gtagId);
  window.gtag('event', 'conversion', {
    send_to: gtagId,
    ...rest,
  });

  return true;
};
