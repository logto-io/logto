import debug from 'debug';

const log = debug('conversion');

export const redditPixelId = 't2_ggt11omdo';
/** The data domain to aggregate the data for Plausible. */
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

type ReportConversionOptions = {
  transactionId?: string;
  redditType?: RedditReportType;
};

export const reportConversion = ({ redditType, transactionId }: ReportConversionOptions) => {
  if (!shouldReport) {
    log('skip reporting conversion:', { redditType, transactionId });
    return;
  }

  if (redditType) {
    reportToReddit(redditType);
  }
};
