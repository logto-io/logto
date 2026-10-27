import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderName } from '@logto/schemas';
import type Client from '@withtyped/client';
import { ResponseError } from '@withtyped/client';

import {
  readPendingConnectorCreation,
  savePendingConnectorCreation,
  type PendingConnectorCreation,
} from './connector-creation-idempotency';
import { abandonConnectorCreation, continueConnectorCreation } from './creation-billing';

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

const checkoutError = (code: string) =>
  new ResponseError({
    status: 409,
    clone: () => ({ json: async () => ({ message: 'Checkout failed.', error: { code } }) }),
  } as Response);

const api = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
const getApi = jest.fn(() => api as unknown as Client<typeof consoleSsoRouter>);
const chooseBillingCustomer = jest.fn();
const options = (restartExpired: boolean) => ({ restartExpired, chooseBillingCustomer });
const operation: PendingConnectorCreation = {
  key: 'creation-key',
  providerName: SsoProviderName.OIDC,
  funding: 'personal',
};
const session = {
  status: 'open',
  sessionId: 'session-one',
  providerName: SsoProviderName.OIDC,
  subscriptionId: null,
  redirectUri: 'https://checkout.stripe.com/session-one',
};

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  getApi.mockReturnValue(api as unknown as Client<typeof consoleSsoRouter>);
  chooseBillingCustomer.mockResolvedValue({});
  savePendingConnectorCreation('alice', operation);
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Supply the browser UUID API in jsdom.
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: jest.fn(() => 'new-key'),
  });
});

it('saves the chosen billing account before sending it with Checkout', async () => {
  chooseBillingCustomer.mockResolvedValue({ customerId: 'cus_other' });
  api.post.mockImplementation(async () => {
    expect(readPendingConnectorCreation('alice')?.customerChoice).toEqual({
      customerId: 'cus_other',
    });
    return session;
  });
  await continueConnectorCreation('alice', operation, getApi, options(true));
  expect(api.post.mock.calls).toEqual([
    [
      '/api/me/console-sso/checkout-session',
      { body: { providerName: operation.providerName, customerId: 'cus_other' } },
    ],
  ]);
});

it('does not start Checkout when the billing account dialog is canceled', async () => {
  // eslint-disable-next-line unicorn/no-useless-undefined -- The dialog resolves to nothing on cancel.
  chooseBillingCustomer.mockResolvedValue(undefined);
  await expect(
    continueConnectorCreation('alice', operation, getApi, options(true))
  ).resolves.toEqual({ status: 'canceled', operation });
  expect(api.post).not.toHaveBeenCalled();
  expect(readPendingConnectorCreation('alice')).toEqual(operation);
});

it('replays a lost Checkout response with the same key, provider and billing account', async () => {
  chooseBillingCustomer.mockResolvedValue({ newCustomer: true });
  api.post.mockRejectedValueOnce(new Error('Network failed')).mockResolvedValueOnce(session);
  await expect(
    continueConnectorCreation('alice', operation, getApi, options(true))
  ).rejects.toThrow('Network failed');
  const saved = readPendingConnectorCreation('alice');
  expect(saved).toEqual({ ...operation, customerChoice: { newCustomer: true } });
  await continueConnectorCreation('alice', saved ?? operation, getApi, options(true));
  expect(chooseBillingCustomer).toHaveBeenCalledTimes(1);
  expect(getApi.mock.calls).toEqual([[operation.key], [operation.key]]);
  expect(api.post.mock.calls[0]).toEqual(api.post.mock.calls[1]);
  expect(api.post.mock.calls[1]).toEqual([
    '/api/me/console-sso/checkout-session',
    { body: { providerName: operation.providerName, newCustomer: true } },
  ]);
});

it.each(['customer_not_found', 'customer_unavailable'])(
  'asks again under a new payment key after Checkout refuses the billing account with %s',
  async (code) => {
    chooseBillingCustomer.mockResolvedValueOnce({ customerId: 'cus_gone' });
    api.post.mockRejectedValueOnce(checkoutError(code)).mockResolvedValueOnce(session);
    await expect(
      continueConnectorCreation('alice', operation, getApi, options(true))
    ).rejects.toBeInstanceOf(ResponseError);
    const saved = readPendingConnectorCreation('alice');
    expect(saved).toEqual({ ...operation, checkoutKey: 'new-key' });
    await continueConnectorCreation('alice', saved ?? operation, getApi, options(true));
    expect(chooseBillingCustomer).toHaveBeenCalledTimes(2);
    expect(getApi.mock.calls).toEqual([[operation.key], ['new-key']]);
    expect(api.post).toHaveBeenLastCalledWith('/api/me/console-sso/checkout-session', {
      body: { providerName: operation.providerName },
    });
  }
);

it('keeps the billing account for a retry after any other Checkout failure', async () => {
  chooseBillingCustomer.mockResolvedValue({ customerId: 'cus_other' });
  api.post.mockRejectedValueOnce(checkoutError('stripe_unavailable'));
  await expect(
    continueConnectorCreation('alice', operation, getApi, options(true))
  ).rejects.toBeInstanceOf(ResponseError);
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...operation,
    customerChoice: { customerId: 'cus_other' },
  });
});

it('restarts a verified unpaid expiry with a fresh payment key and unchanged creation key', async () => {
  const customerChoice = { customerId: 'cus_other' };
  api.get.mockResolvedValue({ ...session, status: 'expired' });
  api.post.mockResolvedValueOnce({ ...session, sessionId: 'session-two' });
  await continueConnectorCreation(
    'alice',
    savePendingConnectorCreation('alice', {
      ...operation,
      customerChoice,
      sessionId: session.sessionId,
    }),
    getApi,
    options(true)
  );
  expect(getApi).toHaveBeenLastCalledWith('new-key');
  expect(chooseBillingCustomer).not.toHaveBeenCalled();
  expect(api.post).toHaveBeenCalledWith('/api/me/console-sso/checkout-session', {
    body: { providerName: operation.providerName, ...customerChoice },
  });
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...operation,
    checkoutKey: 'new-key',
    customerChoice,
    sessionId: 'session-two',
  });
});

it('recovers and expires a lost Checkout before abandoning its key', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    customerChoice: { newCustomer: true },
  });
  api.post.mockResolvedValue(session);
  api.delete.mockResolvedValueOnce({ ...session, status: 'expired' });
  await expect(abandonConnectorCreation('alice', saved, getApi)).resolves.toEqual({
    status: 'abandoned',
  });
  expect(api.post.mock.calls).toEqual([
    [
      '/api/me/console-sso/checkout-session',
      { body: { providerName: operation.providerName, newCustomer: true } },
    ],
  ]);
  expect(api.delete.mock.calls).toEqual([
    [
      '/api/me/console-sso/checkout-session/:sessionId',
      { params: { sessionId: session.sessionId } },
    ],
    ['/api/me/console-sso/connector-creation'],
  ]);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});

it('abandons without Checkout when no billing account was chosen', async () => {
  await expect(abandonConnectorCreation('alice', operation, getApi)).resolves.toEqual({
    status: 'abandoned',
  });
  expect(api.post).not.toHaveBeenCalled();
  expect(api.delete.mock.calls).toEqual([['/api/me/console-sso/connector-creation']]);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});

it('abandons when Checkout refuses the saved billing account', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    customerChoice: { customerId: 'cus_gone' },
  });
  api.post.mockRejectedValue(checkoutError('customer_unavailable'));
  await expect(abandonConnectorCreation('alice', saved, getApi)).resolves.toEqual({
    status: 'abandoned',
  });
  expect(api.delete.mock.calls).toEqual([['/api/me/console-sso/connector-creation']]);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});
