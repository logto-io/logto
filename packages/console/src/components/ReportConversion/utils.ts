import { trySafe } from '@silverhand/essentials';

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

/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods, prefer-rest-params */

/** This function is edited from the Google Tag official code snippet. */
export function gtag(..._: unknown[]) {
  trySafe(() => {
    // We cannot use rest params here since gtag has some internal logic about `arguments` for data transpiling
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    window.dataLayer.push(arguments);
  });
}

/** This function is edited from the LinkedIn Tag official code snippet. */
export function lintrk(..._: unknown[]) {
  // Init LinkedIn tag if needed
  if (!window._linkedin_data_partner_ids) {
    window._linkedin_data_partner_ids = [];
    window._linkedin_data_partner_ids.push(linkedInPartnerId);
  }

  trySafe(() => {
    if (!window.lintrk) {
      window.lintrk = { q: [] };
    }

    window.lintrk.q.push(arguments);
  });
}

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

export const redditPixelId = 't2_ggt11omdo';

/** Report Reddit conversion events. */
export function rdt(..._: unknown[]) {
  trySafe(() => {
    if (!window.rdt) {
      window.rdt = { callQueue: [] };
    }

    window.rdt.callQueue.push(arguments);
  });
}

/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods, prefer-rest-params */
