import { createMockUtils } from '@logto/shared/esm';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

/**
 * The allowlisted fetch builds its dispatcher from the `undici` global dispatcher, which a Jest VM
 * context does not have, so the hand-off is asserted on a stub. The dispatcher itself is covered by
 * the `outbound-request` suite.
 */
const { ssrfProtectedFetch } = mockEsm('#src/utils/outbound-request.js', () => ({
  ssrfProtectedFetch: jest.fn<Promise<Response>, Parameters<typeof fetch>>(
    async () => new Response()
  ),
}));

const { default: fetchWithoutSsrfDispatcher, getOidcProviderFetch } = await import('./fetch.js');

const dispatcher = Symbol('dispatcher');

/** What the pinned provider passes on every outgoing request, see the file overview of `fetch.ts`. */
const providerOptions: RequestInit & { dispatcher?: unknown } = {
  method: 'GET',
  headers: new Headers({ accept: 'application/json', 'user-agent': '' }),
  redirect: 'manual',
  signal: AbortSignal.timeout(2500),
  dispatcher,
};

const stubValues = (values: Partial<typeof EnvSet.values>) => {
  Sinon.stub(EnvSet, 'values').value({ ...EnvSet.values, ...values });
};

describe('getOidcProviderFetch', () => {
  afterEach(() => {
    Sinon.restore();
    ssrfProtectedFetch.mockClear();
  });

  it('should pass requests through with the provider options when nothing applies', async () => {
    stubValues({
      isSsrfProtectionEnabled: true,
      ssrfAllowedAddresses: [],
      openAiCimdRelayHost: undefined,
    });
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());

    await getOidcProviderFetch()('https://rp.example.com/jwks', providerOptions);

    const [input, init] = fetchStub.firstCall.args;
    expect(input).toBe('https://rp.example.com/jwks');
    expect(init).toBe(providerOptions);
  });

  /**
   * The provider's built-in guard has no hook for the allowlist, so a listed address would stay
   * unreachable on this path while being reachable through webhooks and SSO connectors.
   */
  it('should hand requests to the allowlisted fetch without the provider dispatcher', async () => {
    stubValues({ isSsrfProtectionEnabled: true, ssrfAllowedAddresses: ['127.0.0.1'] });

    await getOidcProviderFetch()('https://rp.example.com/jwks', providerOptions);

    expect(ssrfProtectedFetch).toHaveBeenCalledTimes(1);
    const [input, init] = ssrfProtectedFetch.mock.calls[0] ?? [];
    expect(input).toBe('https://rp.example.com/jwks');
    expect(init).toMatchObject({ method: 'GET', redirect: 'manual' });
    expect(init).not.toHaveProperty('dispatcher');
  });

  it('should drop the SSRF-protecting dispatcher when protection is disabled', async () => {
    stubValues({ isSsrfProtectionEnabled: false, ssrfAllowedAddresses: [] });
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());
    const providerFetch = getOidcProviderFetch();

    expect(providerFetch).toBe(fetchWithoutSsrfDispatcher);
    await providerFetch('https://rp.example.com/backchannel-logout', providerOptions);

    const [, init] = fetchStub.firstCall.args;
    expect(init).toMatchObject({ method: 'GET', redirect: 'manual' });
    expect(init).not.toHaveProperty('dispatcher');
  });

  describe('OpenAI CIMD relay', () => {
    const openAiCimdRelayHost = 'relay.example.com';

    const stubRelay = () => {
      stubValues({ isSsrfProtectionEnabled: true, ssrfAllowedAddresses: [], openAiCimdRelayHost });

      return Sinon.stub(globalThis, 'fetch').resolves(new Response());
    };

    it.each([
      'https://chatgpt.com/oauth/client.json',
      'https://chatgpt.com/oauth/abc123/client.json',
      'https://chatgpt.com/oauth/codex/client.json',
      'https://chatgpt.com/oauth/codex/abc123/client.json',
    ])('should fetch the document %s from the relay with the options untouched', async (url) => {
      const fetchStub = stubRelay();

      await getOidcProviderFetch()(`${url}?v=1`, providerOptions);

      const [input, init] = fetchStub.firstCall.args;
      expect(String(input)).toBe(`${url.replace('chatgpt.com', openAiCimdRelayHost)}?v=1`);
      expect(init).toBe(providerOptions);
    });

    it.each([
      'https://chatgpt.com/backend-api/models',
      'https://chatgpt.com/oauth/codex/client.json/extra',
      'https://chatgpt.com//evil.example/client.json',
      'https://rp.example.com/oauth/client.json',
    ])('should leave %s untouched', async (url) => {
      const fetchStub = stubRelay();

      await getOidcProviderFetch()(url, providerOptions);

      const [input, init] = fetchStub.firstCall.args;
      expect(input).toBe(url);
      expect(init).toBe(providerOptions);
    });

    /**
     * GlobalValues rules this combination out today. What this pins is the composition, not the
     * configuration: a change to the dispatcher policy can never skip the relay.
     */
    it('should relay on top of the allowlisted fetch', async () => {
      stubValues({
        isSsrfProtectionEnabled: true,
        ssrfAllowedAddresses: ['127.0.0.1'],
        openAiCimdRelayHost,
      });

      await getOidcProviderFetch()('https://chatgpt.com/oauth/codex/client.json', providerOptions);

      const [input, init] = ssrfProtectedFetch.mock.calls[0] ?? [];
      expect(String(input)).toBe(`https://${openAiCimdRelayHost}/oauth/codex/client.json`);
      expect(init).not.toHaveProperty('dispatcher');
    });
  });
});
