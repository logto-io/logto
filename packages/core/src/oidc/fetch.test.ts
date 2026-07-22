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
      isOidcProviderSsrfProtectionEnabled: true,
    });

    expect(getProviderFetchConfig()).toBeUndefined();
  });

  it('should drop the SSRF-protecting dispatcher when protection is disabled', async () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isOidcProviderSsrfProtectionEnabled: false,
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
