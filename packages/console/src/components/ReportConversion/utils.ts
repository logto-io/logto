export const gtagAwTrackingId = 'AW-11124811245';
/** This ID indicates a user has truly signed up for Logto Cloud. */
export const gtagSignUpConversionId = `AW-11192640559/ZuqUCLvNpasYEK_IiNkp`;
const logtoProductionHostname = 'logto.io';
const linkedInPartnerId = '5096172';
export const linkedInConversionId = '13374828';

/**
 * Due to the special of conversion reporting, it should be `true` only in the
 * Logto Cloud production environment.
 * Add the leading '.' to make it safer (ignore hostnames like "foologto.io").
 */
export const shouldReport = window.location.hostname.endsWith('.' + logtoProductionHostname);

/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */

/** This function is edited from the Google Tag official code snippet. */
export function gtag(..._: unknown[]) {
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  // We cannot use rest params here since gtag has some internal logic about `arguments` for data transpiling
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/** This function is edited from the LinkedIn Tag official code snippet. */
export function lintrk(..._: unknown[]) {
  // Init LinkedIn tag if needed
  if (!window._linkedin_data_partner_ids) {
    window._linkedin_data_partner_ids = [];
    window._linkedin_data_partner_ids.push(linkedInPartnerId);
  }

  if (!window.lintrk) {
    window.lintrk = { q: [] };
  }

  // eslint-disable-next-line prefer-rest-params
  window.lintrk.q.push(arguments);
}

/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */
