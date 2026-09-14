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

  describe('OpenAI CIMD relay', () => {
    const openAiCimdRelayUrl = 'https://relay.example.com';

    it('should send chatgpt.com requests to the relay with the options untouched', async () => {
      Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isSsrfProtectionEnabled: true,
        ssrfAllowedAddresses: [],
        openAiCimdRelayUrl,
      });
      const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
      const config = getProviderFetchConfig();

      await config?.fetch('https://chatgpt.com/oauth/codex/client.json?v=1', requestInit);

      const [input, init] = fetchStub.firstCall.args;
      expect(String(input)).toBe('https://relay.example.com/oauth/codex/client.json?v=1');
      expect(init).toMatchObject({ method: 'POST', dispatcher });
    });

    it('should keep the options carried by a Request input', async () => {
      Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isSsrfProtectionEnabled: true,
        ssrfAllowedAddresses: [],
        openAiCimdRelayUrl,
      });
      const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
      const config = getProviderFetchConfig();

      await config?.fetch(
        new Request('https://chatgpt.com/oauth/codex/client.json', {
          method: 'POST',
          headers: { accept: 'application/json' },
        })
      );

      const [input] = fetchStub.firstCall.args;
      expect(input).toBeInstanceOf(Request);
      expect(input).toMatchObject({
        url: 'https://relay.example.com/oauth/codex/client.json',
        method: 'POST',
      });
      expect(input instanceof Request && input.headers.get('accept')).toBe('application/json');
    });

    it('should leave requests to other hosts untouched', async () => {
      Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isSsrfProtectionEnabled: true,
        ssrfAllowedAddresses: [],
        openAiCimdRelayUrl,
      });
      const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
      const config = getProviderFetchConfig();

      await config?.fetch('https://rp.example.com/jwks', requestInit);

      const [input, init] = fetchStub.firstCall.args;
      expect(input).toBe('https://rp.example.com/jwks');
      expect(init).toMatchObject({ method: 'POST', dispatcher });
    });

    it('should apply the relay on top of the SSRF opt-out', async () => {
      Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isSsrfProtectionEnabled: false,
        ssrfAllowedAddresses: [],
        openAiCimdRelayUrl,
      });
      const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
      const config = getProviderFetchConfig();

      await config?.fetch('https://chatgpt.com/oauth/codex/client.json', requestInit);

      const [input, init] = fetchStub.firstCall.args;
      expect(String(input)).toBe('https://relay.example.com/oauth/codex/client.json');
      expect(init).not.toHaveProperty('dispatcher');
    });
  });
});
