import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

import fetchWithoutSsrfDispatcher, { getOidcProviderFetch } from './fetch.js';

const dispatcher = Symbol('dispatcher');
const requestInit: RequestInit & { dispatcher?: unknown } = {
  method: 'POST',
  dispatcher,
};

describe('getOidcProviderFetch', () => {
  afterEach(() => {
    Sinon.restore();
  });

  it('should preserve the provider native fetch when SSRF protection is enabled', () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isSsrfProtectionEnabled: true,
      ssrfAllowedAddresses: [],
      openAiCimdRelayOrigin: undefined,
    });

    expect(getOidcProviderFetch()).toBeUndefined();
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

    expect(getOidcProviderFetch()).toBeDefined();
  });

  it('should drop the SSRF-protecting dispatcher when protection is disabled', async () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isSsrfProtectionEnabled: false,
      ssrfAllowedAddresses: [],
    });
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
    const providerFetch = getOidcProviderFetch();

    expect(providerFetch).toBe(fetchWithoutSsrfDispatcher);
    await providerFetch?.('https://rp.example.com/backchannel-logout', requestInit);

    expect(fetchStub.calledOnce).toBe(true);
    const [, init] = fetchStub.firstCall.args;
    expect(init).toMatchObject({ method: 'POST' });
    expect(init).not.toHaveProperty('dispatcher');
  });

  describe('OpenAI CIMD relay', () => {
    const openAiCimdRelayOrigin = 'https://relay.example.com';

    const stubRelay = () => {
      Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isSsrfProtectionEnabled: true,
        ssrfAllowedAddresses: [],
        openAiCimdRelayOrigin,
      });

      return Sinon.stub(globalThis, 'fetch').resolves(new Response());
    };

    it.each([
      'https://chatgpt.com/oauth/client.json',
      'https://chatgpt.com/oauth/abc123/client.json',
      'https://chatgpt.com/oauth/codex/client.json',
      'https://chatgpt.com/oauth/codex/abc123/client.json',
    ])('should fetch the document %s from the relay with the options untouched', async (url) => {
      const fetchStub = stubRelay();

      await getOidcProviderFetch()?.(`${url}?v=1`, requestInit);

      const [input, init] = fetchStub.firstCall.args;
      expect(String(input)).toBe(
        `${url.replace('https://chatgpt.com', openAiCimdRelayOrigin)}?v=1`
      );
      expect(init).toMatchObject({ method: 'POST', dispatcher });
    });

    it('should keep the options carried by a Request input', async () => {
      const fetchStub = stubRelay();

      await getOidcProviderFetch()?.(
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

    it.each([
      'https://chatgpt.com/backend-api/models',
      'https://chatgpt.com/oauth/codex/client.json/extra',
      'https://chatgpt.com//evil.example/client.json',
      'https://rp.example.com/oauth/client.json',
    ])('should leave %s untouched', async (url) => {
      const fetchStub = stubRelay();

      await getOidcProviderFetch()?.(url, requestInit);

      const [input, init] = fetchStub.firstCall.args;
      expect(input).toBe(url);
      expect(init).toMatchObject({ method: 'POST', dispatcher });
    });
  });
});
