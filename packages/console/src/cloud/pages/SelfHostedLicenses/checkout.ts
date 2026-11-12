import { type selfHostedLicensesRouter } from '@logto/cloud/routes';
import { ReservedPlanId } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import type Client from '@withtyped/client';
import { ResponseError } from '@withtyped/client';

import { tryReadResponseErrorBody } from '@/cloud/hooks/use-cloud-api';
import { type CheckoutCustomerChoice } from '@/cloud/types/router';

import {
  clearPendingPurchase,
  clearPendingPurchaseOfSession,
  getOrCreatePendingPurchase,
  readPendingPurchase,
  savePendingPurchase,
  type PendingPurchase,
} from './purchase-storage';

type LicensesApi = Client<typeof selfHostedLicensesRouter>;
/** A client that sends the given `Idempotency-Key` with every request. */
type GetLicensesApi = (key: string) => LicensesApi;

const paymentCheckingInterval = 1000;
const paymentCheckingTimeout = 60 * 1000;

export type PurchaseResult =
  | { status: 'canceled' }
  /** The session expired before payment; subscribing again starts a new purchase. */
  | { status: 'expired' }
  | { status: 'redirect'; redirectUri: string }
  /** Paid or paying; only the webhook activates the license, so wait for it. */
  | { status: 'paid'; sessionId: string };

/** Checkout refused the chosen billing Customer, so no session exists for this key. */
const isRefusedCustomerChoice = async (error: unknown) => {
  if (!(error instanceof ResponseError)) {
    return false;
  }
  const body = await tryReadResponseErrorBody(error);
  const code = body?.error?.code;
  return code === 'customer_not_found' || code === 'customer_unavailable';
};

/** `undefined` for an expired session, which ends this payment attempt. */
const toPurchaseResult = ({
  status,
  sessionId,
  redirectUri,
}: {
  status: string;
  sessionId: string;
  redirectUri: Nullable<string>;
}): PurchaseResult | undefined => {
  if (status === 'expired') {
    return;
  }
  if (status === 'open') {
    if (!redirectUri) {
      throw new Error('Checkout did not return a payment page. Please try again.');
    }
    return { status: 'redirect', redirectUri };
  }
  return { status: 'paid', sessionId };
};

const createCheckoutSession = async (
  userId: string,
  purchase: PendingPurchase,
  getApi: GetLicensesApi
) => {
  try {
    const session = await getApi(purchase.key).post(
      '/api/me/self-hosted-licenses/checkout-session',
      { body: { plan: ReservedPlanId.SelfHostedPro, ...purchase.customerChoice } }
    );
    // Persist before navigating to Stripe, so the return and a reload find this session.
    savePendingPurchase(userId, {
      ...purchase,
      sessionId: session.sessionId,
      licenseId: session.licenseId,
    });
    return session;
  } catch (error: unknown) {
    if (await isRefusedCustomerChoice(error)) {
      // The choice is not part of the purchase key, so choosing again needs a new key.
      savePendingPurchase(userId, { key: crypto.randomUUID() });
    }
    throw error;
  }
};

/**
 * Start or resume the saved purchase. A saved session is read rather than created again, and an
 * expired one is replaced by a new purchase that keeps the billing Customer choice.
 */
export const startPurchase = async (
  userId: string,
  getApi: GetLicensesApi,
  chooseBillingCustomer: () => Promise<CheckoutCustomerChoice | undefined>
): Promise<PurchaseResult> => {
  const saved = getOrCreatePendingPurchase(userId);

  if (saved.sessionId) {
    const session = await getApi(saved.key).get(
      '/api/me/self-hosted-licenses/checkout-session/:sessionId',
      { params: { sessionId: saved.sessionId } }
    );
    const result = toPurchaseResult(session);
    if (result) {
      return result;
    }
  }

  const fresh = saved.sessionId
    ? savePendingPurchase(userId, {
        key: crypto.randomUUID(),
        customerChoice: saved.customerChoice,
      })
    : saved;
  const customerChoice = fresh.customerChoice ?? (await chooseBillingCustomer());

  if (!customerChoice) {
    // Nothing was sent with this key, as the choice is saved before the first request.
    clearPendingPurchase(userId);
    return { status: 'canceled' };
  }

  const purchase = savePendingPurchase(userId, { ...fresh, customerChoice });
  const session = await createCheckoutSession(userId, purchase, getApi);
  const result = toPurchaseResult(session);

  if (!result) {
    // A replayed key can return a session that expired since; start over with a new key.
    savePendingPurchase(userId, { key: crypto.randomUUID(), customerChoice });
    return { status: 'expired' };
  }

  return result;
};

/** Expire the session of a purchase the user left Stripe without paying for. */
export const cancelPurchase = async (
  userId: string,
  getApi: GetLicensesApi
): Promise<PurchaseResult> => {
  const purchase = readPendingPurchase(userId);
  if (!purchase?.sessionId) {
    return { status: 'canceled' };
  }

  const session = await getApi(purchase.key).delete(
    '/api/me/self-hosted-licenses/checkout-session/:sessionId',
    { params: { sessionId: purchase.sessionId } }
  );

  // Payment can complete before the session expires; follow it to activation then.
  if (session.status === 'payment_received' || session.status === 'payment_pending') {
    return { status: 'paid', sessionId: session.sessionId };
  }

  clearPendingPurchaseOfSession(userId, purchase.sessionId);
  return { status: 'canceled' };
};

export class PurchaseTimeoutError extends Error {
  name = 'PurchaseTimeoutError';
}

const wait = async (milliseconds: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException('The purchase check was canceled.', 'AbortError'));
    };
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    signal?.addEventListener('abort', abort, { once: true });
  });

/** Read until `isDone`, or reject with {@link PurchaseTimeoutError} after the checking timeout. */
const pollUntil = async <T>(
  read: () => Promise<T>,
  isDone: (value: T) => boolean,
  signal?: AbortSignal
) => {
  const deadline = Date.now() + paymentCheckingTimeout;
  const poll = async (): Promise<T> => {
    signal?.throwIfAborted();
    const value = await read();
    if (isDone(value)) {
      return value;
    }
    if (Date.now() + paymentCheckingInterval > deadline) {
      throw new PurchaseTimeoutError('The purchase is still being processed.');
    }
    await wait(paymentCheckingInterval, signal);
    return poll();
  };
  return poll();
};

type ActivationResult = { status: 'expired' } | { status: 'activated'; licenseId: string };

/**
 * Only the Stripe webhook activates a license, so a paid session alone does not show the license
 * is ready. Wait for the payment, then for the license to leave `pending`.
 */
export const waitForActivation = async (
  userId: string,
  sessionId: string,
  api: LicensesApi,
  signal?: AbortSignal
): Promise<ActivationResult> => {
  const session = await pollUntil(
    async () =>
      api.get('/api/me/self-hosted-licenses/checkout-session/:sessionId', {
        params: { sessionId },
      }),
    ({ status }) => status === 'payment_received' || status === 'expired',
    signal
  );

  if (session.status === 'expired') {
    clearPendingPurchaseOfSession(userId, sessionId);
    return { status: 'expired' };
  }

  const { licenseId } = session;
  await pollUntil(
    async () => api.get('/api/me/self-hosted-licenses/:id', { params: { id: licenseId } }),
    ({ status }) => status !== 'pending',
    signal
  );
  clearPendingPurchaseOfSession(userId, sessionId);

  return { status: 'activated', licenseId };
};
