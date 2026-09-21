import { createMockUtils } from '@logto/shared/esm';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import { ssrfProtectedFetch } from '#src/utils/outbound-request.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const globalDispatcher = Symbol('global dispatcher');

/** A Jest VM context has no `undici` global dispatcher, so the opt-out gets a stand-in. */
mockEsm('#src/utils/outbound-request.js', () => ({
  ssrfProtectedFetch,
  getUndiciGlobalDispatcher: () => globalDispatcher,
}));

const { default: fetchWithoutSsrfDispatcher, getProviderFetchConfig } = await import('./fetch.js');

const dispatcher = Symbol('dispatcher');
const requestInit: RequestInit & { dispatcher?: unknown } = {
  method: 'POST',
  dispatcher,
};

const stubValues = (values: Partial<typeof EnvSet.values>) => {
  Sinon.stub(EnvSet, 'values').value({ ...EnvSet.values, ...values });
};

describe('getProviderFetchConfig', () => {
  afterEach(() => {
    Sinon.restore();
  });

  it('should preserve the provider native fetch when SSRF protection is enabled', () => {
    stubValues({ isSsrfProtectionEnabled: true, ssrfAllowedAddresses: [] });

    expect(getProviderFetchConfig()).toBeUndefined();
  });

  /**
   * The provider's built-in guard has no hook for the allowlist, so a listed address would stay
   * unreachable on this path while being reachable through webhooks and SSO connectors.
   */
  it('should override the provider fetch with the allowlisted one when an allowlist is configured', () => {
    stubValues({ isSsrfProtectionEnabled: true, ssrfAllowedAddresses: ['127.0.0.1'] });

    expect(getProviderFetchConfig()?.fetch).toBe(ssrfProtectedFetch);
  });

  /** `fetch` takes `init.dispatcher` before a `Request` input's own, so the override must be explicit. */
  it.each([
    ['a URL string', 'https://rp.example.com/backchannel-logout'],
    [
      'a Request carrying the provider dispatcher',
      new Request('https://rp.example.com/backchannel-logout', requestInit),
    ],
  ])(
    'should send %s through the global dispatcher when protection is disabled',
    async (_, input) => {
      stubValues({ isSsrfProtectionEnabled: false, ssrfAllowedAddresses: [] });
      const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
      const config = getProviderFetchConfig();

      expect(config).toHaveProperty('fetch', fetchWithoutSsrfDispatcher);
      await config?.fetch(input, requestInit);

      const [forwarded, init] = fetchStub.firstCall.args;
      expect(forwarded).toBe(input);
      expect(init).toMatchObject({ method: 'POST', dispatcher: globalDispatcher });
    }
  );
});
