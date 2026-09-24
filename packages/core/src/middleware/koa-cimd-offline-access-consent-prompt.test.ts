import { type CimdConfig } from '@logto/schemas';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import koaCimdOfflineAccessConsentPrompt from './koa-cimd-offline-access-consent-prompt.js';

const { jest } = import.meta;

const cimdClientId = 'https://client.example.com/metadata.json';
const offlineAccessRequest = Object.freeze({
  client_id: cimdClientId,
  scope: 'openid offline_access',
});

const getCimdConfig = jest.fn(
  async (): Promise<CimdConfig> => ({ enabled: true, addConsentPromptForOfflineAccess: true })
);
const queries = new MockQueries({ logtoConfigs: { getCimdConfig } });

const runMiddleware = async (params: Record<string, string>, { cimdEnabled = true } = {}) => {
  const ctx = createMockContext({ url: `/auth?${new URLSearchParams(params).toString()}` });
  const next = jest.fn();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the fields the middleware reads
  const envSet = { oidc: { cimdEnabled } } as EnvSet;

  await koaCimdOfflineAccessConsentPrompt(envSet, queries)(ctx, next);

  expect(next).toHaveBeenCalledTimes(1);

  return ctx.request.query;
};

describe('koaCimdOfflineAccessConsentPrompt()', () => {
  beforeEach(() => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isSsrfProtectionEnabled: true,
      ssrfAllowedAddresses: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    Sinon.restore();
  });

  it('adds the consent prompt to a CIMD authorization request for offline access', async () => {
    await expect(runMiddleware(offlineAccessRequest)).resolves.toEqual({
      ...offlineAccessRequest,
      prompt: 'consent',
    });
  });

  it('keeps the existing prompt values', async () => {
    await expect(runMiddleware({ ...offlineAccessRequest, prompt: 'login' })).resolves.toEqual({
      ...offlineAccessRequest,
      prompt: 'login consent',
    });
  });

  it.each<CimdConfig>([
    { enabled: true },
    { enabled: true, addConsentPromptForOfflineAccess: false },
  ])('leaves the request unchanged while the setting is off: %j', async (config) => {
    getCimdConfig.mockResolvedValueOnce(config);

    await expect(runMiddleware(offlineAccessRequest)).resolves.toEqual(offlineAccessRequest);
  });

  it.each(['consent', 'login consent', 'none'])('leaves prompt=%s unchanged', async (prompt) => {
    await expect(runMiddleware({ ...offlineAccessRequest, prompt })).resolves.toEqual({
      ...offlineAccessRequest,
      prompt,
    });
    expect(getCimdConfig).not.toHaveBeenCalled();
  });

  it('leaves a request without offline access unchanged', async () => {
    const request = { client_id: cimdClientId, scope: 'openid profile' };

    await expect(runMiddleware(request)).resolves.toEqual(request);
    expect(getCimdConfig).not.toHaveBeenCalled();
  });

  it('leaves a registered application request unchanged', async () => {
    const request = { ...offlineAccessRequest, client_id: 'registered-app-id' };

    await expect(runMiddleware(request)).resolves.toEqual(request);
    expect(getCimdConfig).not.toHaveBeenCalled();
  });

  it('leaves the request unchanged while CIMD is disabled for the tenant', async () => {
    await expect(runMiddleware(offlineAccessRequest, { cimdEnabled: false })).resolves.toEqual(
      offlineAccessRequest
    );
    expect(getCimdConfig).not.toHaveBeenCalled();
  });
});
