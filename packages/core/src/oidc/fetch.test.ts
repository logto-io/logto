import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

import fetchWithoutSsrfDispatcher, { getProviderFetchConfig } from './fetch.js';

const dispatcher = Symbol('dispatcher');
const requestInit: RequestInit & { dispatcher?: unknown } = {
  method: 'POST',
  dispatcher,
};

describe('getProviderFetchConfig', () => {
  afterEach(() => {
    Sinon.restore();
  });

  it('should preserve the provider native fetch when SSRF protection is enabled', () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isSsrfProtectionEnabled: true,
      ssrfAllowedAddresses: [],
    });

    expect(getProviderFetchConfig()).toBeUndefined();
  });

  /**
   * The provider's built-in guard has no hook for the allowlist, so a listed address would stay
   * unreachable on this path while being reachable through webhooks and SSO connectors.
   */
  it('should override the provider fetch when an allowlist is configured', () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isSsrfProtectionEnabled: true,
      ssrfAllowedAddresses: ['127.0.0.1'],
    });

    expect(getProviderFetchConfig()).toHaveProperty('fetch');
  });

  it('should drop the SSRF-protecting dispatcher when protection is disabled', async () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isSsrfProtectionEnabled: false,
      ssrfAllowedAddresses: [],
    });
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
    const config = getProviderFetchConfig();

    expect(config).toHaveProperty('fetch', fetchWithoutSsrfDispatcher);
    await config?.fetch('https://rp.example.com/backchannel-logout', requestInit);

    expect(fetchStub.calledOnce).toBe(true);
    const [, init] = fetchStub.firstCall.args;
    expect(init).toMatchObject({ method: 'POST' });
    expect(init).not.toHaveProperty('dispatcher');
  });
});
