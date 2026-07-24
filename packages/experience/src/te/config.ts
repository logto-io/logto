/* TE:BEGIN qr-push-factor */
/**
 * TripleEnable · QR + Push factors — configuration.
 *
 * These two factors are surfaced in Logto as regular **connectors**, so they can be
 * enabled/disabled from the admin console like any other sign-in method. The console and
 * the Logto core are NOT forked: we only recognise the connector `target` here and route
 * to our own screen instead of redirecting to a third party.
 *
 * To wire them up, create two connectors in the console whose `target` is one of the keys
 * of `teWalletTargets` below.
 *
 * Where each factor shows up follows what it needs to know:
 * - **QR** is identifier-less, so it sits on the first screen next to the social buttons.
 * - **Push** has to know which devices to notify, so it appears in the verification-methods
 *   list, once the user has typed their email, username or phone.
 */

export enum TeWalletMode {
  /** Show a scannable QR; any enrolled device may approve it. */
  Qr = 'qr',
  /** Send a push to a specific enrolled device (e.g. "iPhone X"). */
  Push = 'push',
}

/**
 * Maps a connector `target` to the wallet factor it represents.
 * Keep these values in sync with the connectors created in the admin console.
 */
export const teWalletTargets: Readonly<Record<string, TeWalletMode>> = Object.freeze({
  'te-qr': TeWalletMode.Qr,
  'te-push': TeWalletMode.Push,
});

/** Returns the wallet factor for a connector target, or `undefined` if it is a regular connector. */
export const getTeWalletMode = (target: string): TeWalletMode | undefined =>
  teWalletTargets[target];

/** Dedicated screens, registered in `App.tsx` alongside the passkey one. */
export const teRoutes = Object.freeze({
  qr: '/sign-in/te-qr',
  push: '/sign-in/te-push',
});

type TeRuntimeConfig = {
  idpUrl?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __TE_CONFIG__?: TeRuntimeConfig;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ImportMetaEnv {
    readonly VITE_TE_IDP_URL?: string;
  }
}

const buildTimeIdpUrl = import.meta.env.VITE_TE_IDP_URL;

/**
 * Base URL of the TripleEnable IdP that owns the device registry and the signing challenges.
 * Resolution order: runtime config (injected into the page) → build-time env → default.
 */
export const teIdpUrl = (
  window.__TE_CONFIG__?.idpUrl ??
  buildTimeIdpUrl ??
  'http://localhost:3010'
).replace(/\/$/, '');

/** How often the browser asks the IdP whether the challenge was approved. */
export const tePollIntervalMs = 2000;

/** Give up waiting for an approval after this long. */
export const teChallengeTimeoutMs = 3 * 60 * 1000;
/* TE:END qr-push-factor */
