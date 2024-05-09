import { cond } from '@silverhand/essentials';
import debug from 'debug';

const log = debug('conversion');

export const gtagAwTrackingId = 'AW-11124811245';
export enum GtagConversionId {
  /** This ID indicates a user has truly signed up for Logto Cloud. */
  SignUp = 'AW-11192640559/ZuqUCLvNpasYEK_IiNkp',
  /** This ID indicates a user has created a production tenant. */
  CreateProductionTenant = 'AW-11192640559/m04fCMDrxI0ZEK_IiNkp',
  /** This ID indicates a user has purchased a Pro plan. */
  PurchaseProPlan = 'AW-11192640559/WjCtCKHCtpgZEK_IiNkp',
}

export const redditPixelId = 't2_ggt11omdo';
export const plausibleDataDomain = 'logto.io';

const logtoProductionHostname = 'logto.io';

/**
 * Due to the special of conversion reporting, it should be `true` only in the
 * Logto Cloud production environment.
 * Add the leading '.' to make it safer (ignore hostnames like "foologto.io").
 */
export const shouldReport = window.location.hostname.endsWith('.' + logtoProductionHostname);

const sha256 = async (message: string) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  // https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
  return [...new Uint8Array(hash)].map((value) => value.toString(16).padStart(2, '0')).join('');
};

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
  return sha256(canonicalizedEmail);
};

/**
 * Add more if needed: https://reddit.my.site.com/helpcenter/s/article/Install-the-Reddit-Pixel-on-your-website
 */
type RedditReportType = 'PageVisit' | 'ViewContent' | 'Search' | 'Purchase' | 'Lead' | 'SignUp';

const reportToReddit = (redditType: RedditReportType) => {
  if (!window.rdt) {
    log('report:', 'window.rdt is not available');
    return false;
  }

  log('report:', 'redditType =', redditType);
  window.rdt('track', redditType);

  return true;
};

export const reportToGoogle = (
  gtagId: GtagConversionId,
  { transactionId }: { transactionId?: string } = {}
) => {
  if (!window.gtag) {
    log('report:', 'window.gtag is not available');
    return false;
  }

  const run = async () => {
    const transaction = cond(transactionId && { transaction_id: await sha256(transactionId) });

    log('report:', 'gtagId =', gtagId, 'transaction =', transaction);
    window.gtag?.('event', 'conversion', {
      send_to: gtagId,
      ...transaction,
    });
  };

  void run();

  return true;
};

type ReportConversionOptions = {
  transactionId?: string;
  gtagId?: GtagConversionId;
  redditType?: RedditReportType;
};

export const reportConversion = async ({
  gtagId,
  redditType,
  transactionId,
}: ReportConversionOptions) => {
  if (!shouldReport) {
    log('skip reporting conversion:', { gtagId, redditType, transactionId });
    return;
  }

  return Promise.all([
    gtagId ? reportToGoogle(gtagId, { transactionId }) : undefined,
    redditType ? reportToReddit(redditType) : undefined,
  ]);
};
