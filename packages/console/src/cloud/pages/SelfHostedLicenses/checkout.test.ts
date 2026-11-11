import { type selfHostedLicensesRouter } from '@logto/cloud/routes';
import type Client from '@withtyped/client';
import { ResponseError } from '@withtyped/client';

import { cancelPurchase, PurchaseTimeoutError, startPurchase, waitForActivation } from './checkout';
import { readPendingPurchase, savePendingPurchase } from './purchase-storage';

// Jest's CommonJS resolver needs a virtual module for the ESM-only client package.
jest.mock(
  '@withtyped/client',
  () => ({
    ResponseError: class extends Error {
      constructor(readonly response: Response) {
        super('Response error');
      }
    },
  }),
  { virtual: true }
);
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  // Not a mock function, so `jest.resetAllMocks` keeps it.
  tryReadResponseErrorBody: async (error: ResponseError) => error.response.clone().json(),
}));

type Api = Client<typeof selfHostedLicensesRouter>;

/** `@types/jest` predates the async fake-timer API that the installed Jest provides. */
const advanceTimersByTimeAsync = async (milliseconds: number) =>
  (
    jest as unknown as { advanceTimersByTimeAsync: (milliseconds: number) => Promise<unknown> }
  ).advanceTimersByTimeAsync(milliseconds);

const checkoutError = (code: string) =>
  new ResponseError({
    status: 400,
    clone: () => ({ json: async () => ({ message: 'Checkout failed.', error: { code } }) }),
  } as Response);

const api = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
const getApi = jest.fn((_key: string) => api as unknown as Api);
const chooseBillingCustomer = jest.fn();

const openSession = {
  licenseId: 'license-one',
  sessionId: 'session-one',
  redirectUri: 'https://checkout.stripe.com/session-one',
  status: 'open',
};
const paidSession = { ...openSession, redirectUri: null, status: 'payment_received' };
const license = (status: string) => ({ id: 'license-one', status });

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  getApi.mockReturnValue(api as unknown as Api);
  api.post.mockResolvedValue(openSession);
  chooseBillingCustomer.mockResolvedValue({});
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Supply the browser UUID API in jsdom.
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: jest.fn().mockReturnValueOnce('key-one').mockReturnValue('key-two'),
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('startPurchase', () => {
  it('saves the purchase and Customer choice before Checkout, then redirects to Stripe', async () => {
    chooseBillingCustomer.mockResolvedValue({ customerId: 'cus_other' });
    api.post.mockImplementation(async () => {
      expect(readPendingPurchase('alice')).toEqual({
        key: 'key-one',
        customerChoice: { customerId: 'cus_other' },
      });
      return openSession;
    });

    await expect(startPurchase('alice', getApi, chooseBillingCustomer)).resolves.toEqual({
      status: 'redirect',
      redirectUri: openSession.redirectUri,
    });
    expect(getApi).toHaveBeenCalledWith('key-one');
    expect(api.post).toHaveBeenCalledWith('/api/me/self-hosted-licenses/checkout-session', {
      body: { plan: 'self-hosted-pro', customerId: 'cus_other' },
    });
    expect(readPendingPurchase('alice')).toEqual({
      key: 'key-one',
      customerChoice: { customerId: 'cus_other' },
      sessionId: 'session-one',
      licenseId: 'license-one',
    });
  });

  it('resumes after a reload with the same key and choice, without asking again', async () => {
    savePendingPurchase('alice', { key: 'saved-key', customerChoice: { newCustomer: true } });

    await startPurchase('alice', getApi, chooseBillingCustomer);

    expect(chooseBillingCustomer).not.toHaveBeenCalled();
    expect(getApi.mock.calls).toEqual([['saved-key']]);
    expect(api.post).toHaveBeenCalledWith('/api/me/self-hosted-licenses/checkout-session', {
      body: { plan: 'self-hosted-pro', newCustomer: true },
    });
  });

  it('reads a saved session instead of creating another', async () => {
    savePendingPurchase('alice', {
      key: 'saved-key',
      customerChoice: {},
      sessionId: 'session-one',
    });
    api.get.mockResolvedValue(paidSession);

    await expect(startPurchase('alice', getApi, chooseBillingCustomer)).resolves.toEqual({
      status: 'paid',
      sessionId: 'session-one',
    });
    expect(api.get).toHaveBeenCalledWith(
      '/api/me/self-hosted-licenses/checkout-session/:sessionId',
      { params: { sessionId: 'session-one' } }
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it('starts a new purchase with the same choice when the saved session expired', async () => {
    savePendingPurchase('alice', {
      key: 'saved-key',
      customerChoice: { customerId: 'cus_other' },
      sessionId: 'session-old',
    });
    api.get.mockResolvedValue({ ...openSession, sessionId: 'session-old', status: 'expired' });

    await startPurchase('alice', getApi, chooseBillingCustomer);

    expect(chooseBillingCustomer).not.toHaveBeenCalled();
    expect(getApi).toHaveBeenLastCalledWith('key-one');
    expect(readPendingPurchase('alice')).toMatchObject({
      key: 'key-one',
      customerChoice: { customerId: 'cus_other' },
      sessionId: 'session-one',
    });
  });

  it.each(['customer_not_found', 'customer_unavailable'])(
    'drops a choice refused with %s, and asks again with a new key',
    async (code) => {
      chooseBillingCustomer.mockResolvedValueOnce({ customerId: 'cus_gone' });
      api.post.mockRejectedValueOnce(checkoutError(code));

      await expect(startPurchase('alice', getApi, chooseBillingCustomer)).rejects.toBeInstanceOf(
        ResponseError
      );
      expect(readPendingPurchase('alice')).toEqual({ key: 'key-two' });

      await startPurchase('alice', getApi, chooseBillingCustomer);
      expect(chooseBillingCustomer).toHaveBeenCalledTimes(2);
      expect(getApi).toHaveBeenLastCalledWith('key-two');
      expect(api.post).toHaveBeenLastCalledWith('/api/me/self-hosted-licenses/checkout-session', {
        body: { plan: 'self-hosted-pro' },
      });
    }
  );

  it('keeps the saved purchase on any other Checkout failure', async () => {
    api.post.mockRejectedValueOnce(checkoutError('stripe_unavailable'));

    await expect(startPurchase('alice', getApi, chooseBillingCustomer)).rejects.toBeInstanceOf(
      ResponseError
    );
    expect(readPendingPurchase('alice')).toEqual({ key: 'key-one', customerChoice: {} });
  });

  it('sends nothing and forgets the purchase when the Customer picker is canceled', async () => {
    chooseBillingCustomer.mockImplementation(async () => {
      // The picker resolves to nothing when the user cancels it.
    });

    await expect(startPurchase('alice', getApi, chooseBillingCustomer)).resolves.toEqual({
      status: 'canceled',
    });
    expect(api.post).not.toHaveBeenCalled();
    expect(readPendingPurchase('alice')).toBeUndefined();
  });
});

describe('cancelPurchase', () => {
  it('expires the saved session and forgets the purchase', async () => {
    savePendingPurchase('alice', {
      key: 'saved-key',
      customerChoice: {},
      sessionId: 'session-one',
    });
    api.delete.mockResolvedValue({ ...openSession, status: 'expired' });

    await expect(cancelPurchase('alice', getApi)).resolves.toEqual({ status: 'canceled' });
    expect(api.delete).toHaveBeenCalledWith(
      '/api/me/self-hosted-licenses/checkout-session/:sessionId',
      { params: { sessionId: 'session-one' } }
    );
    expect(readPendingPurchase('alice')).toBeUndefined();
  });

  it('follows a payment that completed before the session could expire', async () => {
    savePendingPurchase('alice', {
      key: 'saved-key',
      customerChoice: {},
      sessionId: 'session-one',
    });
    api.delete.mockResolvedValue(paidSession);

    await expect(cancelPurchase('alice', getApi)).resolves.toEqual({
      status: 'paid',
      sessionId: 'session-one',
    });
    expect(readPendingPurchase('alice')?.sessionId).toBe('session-one');
  });
});

describe('waitForActivation', () => {
  it('waits for the payment, then for the webhook to activate the license', async () => {
    jest.useFakeTimers();
    savePendingPurchase('alice', {
      key: 'saved-key',
      customerChoice: {},
      sessionId: 'session-one',
    });
    api.get.mockImplementation(async (path: string) =>
      path === '/api/me/self-hosted-licenses/:id' ? license('active') : paidSession
    );
    api.get
      .mockResolvedValueOnce({ ...paidSession, status: 'payment_pending' })
      .mockResolvedValueOnce(paidSession)
      // Until the webhook runs, the license is `pending` and reports its keys as expired.
      .mockResolvedValueOnce({ ...license('pending'), keyUnavailableReason: 'expired' });

    const result = waitForActivation('alice', 'session-one', api as unknown as Api);
    await advanceTimersByTimeAsync(3000);

    await expect(result).resolves.toEqual({ status: 'activated', licenseId: 'license-one' });
    expect(api.get).toHaveBeenCalledTimes(4);
    expect(readPendingPurchase('alice')).toBeUndefined();
  });

  it('keeps the purchase when the license is not active before the timeout', async () => {
    jest.useFakeTimers();
    savePendingPurchase('alice', {
      key: 'saved-key',
      customerChoice: {},
      sessionId: 'session-one',
    });
    api.get.mockImplementation(async (path: string) =>
      path === '/api/me/self-hosted-licenses/:id' ? license('pending') : paidSession
    );

    const result = waitForActivation('alice', 'session-one', api as unknown as Api);
    const assertion = expect(result).rejects.toBeInstanceOf(PurchaseTimeoutError);
    await advanceTimersByTimeAsync(61_000);

    await assertion;
    expect(readPendingPurchase('alice')?.sessionId).toBe('session-one');
  });

  it('never clears a purchase started again for another session', async () => {
    savePendingPurchase('alice', {
      key: 'other-key',
      customerChoice: {},
      sessionId: 'session-two',
    });
    api.get.mockResolvedValue({ ...openSession, status: 'expired' });

    await expect(waitForActivation('alice', 'session-one', api as unknown as Api)).resolves.toEqual(
      { status: 'expired' }
    );
    expect(readPendingPurchase('alice')?.sessionId).toBe('session-two');
  });
});
