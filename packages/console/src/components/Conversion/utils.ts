import { cond } from '@silverhand/essentials';
import debug from 'debug';

const log = debug('conversion');

export const gtagAwTrackingId = 'AW-11124811245';
export enum GtagConversionId {
  /** This ID indicates a user has truly signed up for Logto Cloud. */
  SignUp = 'AW-11192640559/ZuqUCLvNpasYEK_IiNkp',
  /** This ID indicates a user has created their first app. */
  CreateFirstApp = 'AW-11192640559/jbsaCPS67q8ZEK_IiNkp',
  /** This ID indicates a user has created a production tenant. */
  CreateProductionTenant = 'AW-11192640559/m04fCMDrxI0ZEK_IiNkp',
  /** This ID indicates a user has purchased a Pro plan. */
  PurchaseProPlan = 'AW-11192640559/WjCtCKHCtpgZEK_IiNkp',
}

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

export const reportToGoogle = (
  gtagId: GtagConversionId,
  { transactionId }: { transactionId?: string } = {}
) => {
  if (!window.gtag) {
    log('report:', 'window.gtag is not available');
    return false;
  }

  if (!shouldReport) {
    log('skip reporting to Google:', { gtagId, transactionId });
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
};
