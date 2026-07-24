/* TE:BEGIN qr-push-factor */
/**
 * TripleEnable · QR + Push factors — IdP client.
 *
 * Talks to the TripleEnable IdP (device registry + signing challenges). This is a plain
 * `fetch` client on purpose: the shared `@/apis/api` instance is bound to Logto's own
 * origin and its interaction hooks, while these calls go to a different host.
 *
 * The IdP must allow this origin via CORS.
 */

import { teIdpUrl, type TeWalletMode } from './config';

export type TeDevice = {
  deviceId: string;
  /** Human name shown in the device picker, e.g. "iPhone X". */
  name: string;
  platform?: string;
};

export type TeChallenge = {
  challengeId: string;
  /** Data-URL PNG rendered by the IdP, so the fork needs no QR dependency. */
  qrDataUrl?: string;
};

export type TeChallengeStatus =
  | { status: 'pending' }
  | { status: 'denied' | 'expired' }
  | {
      status: 'approved';
      /** Logto one-time token minted by the IdP after verifying the device signature. */
      oneTimeToken: string;
      /** Identity that signed; used as the Logto sign-in identifier. */
      email: string;
      /** Device that approved, for display purposes. */
      deviceName?: string;
    };

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${teIdpUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TripleEnable IdP request failed (${response.status}): ${path}`);
  }

  return response.json();
};

/** Lists the devices enrolled for an identity, so the user can pick where the push goes. */
export const listTeDevices = async (email: string) =>
  request<{ devices: TeDevice[] }>(`/te/devices?email=${encodeURIComponent(email)}`);

/**
 * Creates a signing challenge.
 * For `push`, the IdP publishes a notification to the chosen device.
 * For `qr`, the IdP returns a QR the wallet can scan.
 */
export const startTeChallenge = async (payload: {
  mode: TeWalletMode;
  email?: string;
  deviceId?: string;
}) =>
  request<TeChallenge>('/te/challenge', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

/** Polls a challenge until the wallet approves, denies, or it expires. */
export const getTeChallenge = async (challengeId: string) =>
  request<TeChallengeStatus>(`/te/challenge/${encodeURIComponent(challengeId)}`);
/* TE:END qr-push-factor */
