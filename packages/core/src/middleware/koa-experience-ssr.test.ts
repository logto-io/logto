import { ssrPlaceholder } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaExperienceSsr from './koa-experience-ssr.js';

const { jest } = import.meta;

describe('koaExperienceSsr()', () => {
  const phrases = { foo: 'bar' };
  const baseCtx = Object.freeze({
    ...createContextWithRouteParameters({}),
    locale: 'en',
    query: {},
    set: jest.fn(),
  });
  const tenant = new MockTenant(
    undefined,
    {
      customPhrases: {
        findAllCustomLanguageTags: jest.fn().mockResolvedValue([]),
      },
    },
    undefined,
    {
      signInExperiences: {
        getFullSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
      },
      phrases: { getPhrases: jest.fn().mockResolvedValue(phrases) },
    }
  );

  const next = jest.fn().mockReturnValue(Promise.resolve());

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() and do nothing if the response body is not a string', async () => {
    const symbol = Symbol('nothing');
    const ctx = { ...baseCtx, body: symbol };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.body).toBe(symbol);
  });

  it('should call next() and do nothing if the request path is not an index path', async () => {
    const ctx = { ...baseCtx, path: '/foo', body: '...' };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.body).toBe('...');
  });

  it('should call next() and do nothing if the required placeholders are not present', async () => {
    const ctx = { ...baseCtx, path: '/', body: '...' };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.body).toBe('...');
  });

  it('should prefetch the experience data and inject it into the HTML response', async () => {
    const ctx = {
      ...baseCtx,
      path: '/',
      body: `<script>
        const logtoSsr=${ssrPlaceholder};
      </script>`,
    };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.body).not.toContain(ssrPlaceholder);
    expect(ctx.body).toContain(
      `const logtoSsr=Object.freeze(${JSON.stringify({
        signInExperience: { data: mockSignInExperience },
        phrases: { lng: 'en', data: phrases },
      })});`
    );
  });
});
