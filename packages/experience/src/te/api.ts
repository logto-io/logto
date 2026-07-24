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
  /** QR only: data-URL PNG rendered by the IdP, so the fork needs no QR dependency. */
  qrDataUrl?: string;
  /** QR only: the same content encoded in the image, handy for debugging. */
  qrPayload?: string;
  /**
   * Push only: the number the user must tap on the phone. Showing it here and asking
   * for it there is what stops a blind "approve" under a prompt-bombing attack.
   */
  matchNumber?: number;
};

export type TeChallengeStatus =
  | { status: 'pending' }
  | { status: 'denied' | 'expired' | 'mismatch' }
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

/**
 * Lists the devices enrolled for an identity, so the user can pick where the push goes.
 * The identifier is whatever the user typed on the sign-in page — email, username or phone.
 */
export const listTeDevices = async (identifier: string) =>
  request<{ devices: TeDevice[] }>(`/te/devices?identifier=${encodeURIComponent(identifier)}`);

/**
 * Whether this identity is a TripleEnable account, i.e. it has at least one enrolled
 * device. Used to decide if the user should be offered a choice of factor.
 *
 * Never throws: if the IdP is unreachable we fall back to Logto's native flow rather
 * than blocking sign-in.
 */
export const hasTeDevices = async (identifier: string) => {
  try {
    const { devices } = await listTeDevices(identifier);
    return devices.length > 0;
  } catch {
    return false;
  }
};

/** Hex rather than base64url: one line, no dependency, and trivial to mirror in the IdP. */
const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

/**
 * Channel binding, the same idea as PKCE: this browser keeps a secret and publishes
 * only its hash. The challenge id travels inside the QR and over a public broker, so
 * on its own it must not be enough to claim the session — presenting the verifier is
 * what proves "I am the tab that started this".
 */
export const createTeVerifier = async () => {
  const verifier = toHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));

  return { verifier, verifierHash: toHex(digest) };
};

/**
 * Creates a signing challenge.
 * For `push`, the IdP publishes a notification to the chosen device.
 * For `qr`, the IdP returns a QR the wallet can scan.
 */
export const startTeChallenge = async (payload: {
  mode: TeWalletMode;
  email?: string;
  deviceId?: string;
  verifierHash: string;
  client?: string;
}) =>
  request<TeChallenge>('/te/challenge', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

/**
 * Polls a challenge until the wallet approves, denies, or it expires.
 * The verifier goes in the body, never in the URL, and the token only comes back to
 * whoever can present it.
 */
export const getTeChallenge = async (
  challengeId: string,
  verifier: string
): Promise<TeChallengeStatus> => {
  const response = await fetch(
    `${teIdpUrl}/te/challenge/${encodeURIComponent(challengeId)}/status`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ verifier }),
    }
  );

  // Once a challenge lapses the IdP forgets it, so further polls 404. That is an
  // outcome, not a network blip: treating it as one left the screen waiting forever.
  if (response.status === 404) {
    return { status: 'expired' } satisfies TeChallengeStatus;
  }

  if (!response.ok) {
    throw new Error(`TripleEnable IdP request failed (${response.status})`);
  }

  return response.json();
};
/* TE:END qr-push-factor */
