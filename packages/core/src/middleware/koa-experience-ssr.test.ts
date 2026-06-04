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
    expect(ctx.body).toContain('const logtoSsr=Object.freeze(');

    // Extract and parse the injected JSON rather than comparing against a bare `JSON.stringify`, which
    // would diverge from `serializeSsrData`'s `<`/`>`/`&` escaping the moment the mock gains such a char.
    const serialized = /Object\.freeze\((?<json>.+)\)/.exec(ctx.body)?.groups?.json;
    expect(JSON.parse(serialized!)).toEqual({
      signInExperience: { data: mockSignInExperience },
      phrases: { lng: 'en', data: phrases },
    });
  });

  it('should inline custom CSS into the <head> when present', async () => {
    (tenant.libraries.signInExperiences.getFullSignInExperience as jest.Mock).mockResolvedValueOnce(
      { ...mockSignInExperience, customCss: '.foo { color: red; }' }
    );

    const ctx = {
      ...baseCtx,
      path: '/',
      body: `<head><script>const logtoSsr=${ssrPlaceholder};</script></head>`,
    };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);

    expect(ctx.body).toContain('<style data-custom-css>.foo { color: red; }</style></head>');
  });

  it('should escape the `</style>` sequence in custom CSS to avoid breaking out of the tag', async () => {
    (tenant.libraries.signInExperiences.getFullSignInExperience as jest.Mock).mockResolvedValueOnce(
      {
        ...mockSignInExperience,
        customCss: 'body::before { content: "</style>"; }',
      }
    );

    const ctx = {
      ...baseCtx,
      path: '/',
      body: `<head><script>const logtoSsr=${ssrPlaceholder};</script></head>`,
    };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);

    // The dangerous `</style` becomes `<\/style`, which the HTML parser cannot treat as an end tag.
    expect(ctx.body).toContain('content: "<\\/style>"');
  });

  // The regex matches the `</style` prefix without requiring the closing `>`, so every end-tag variant
  // the HTML parser accepts — uppercase, or whitespace before `>` — is defused the same way.
  it.each(['</STYLE>', '</style >', '</style\n>'])(
    'should escape the `%s` end-tag variant in custom CSS',
    async (variant) => {
      (
        tenant.libraries.signInExperiences.getFullSignInExperience as jest.Mock
      ).mockResolvedValueOnce({
        ...mockSignInExperience,
        customCss: `body::before { content: "${variant}"; }`,
      });

      const ctx = {
        ...baseCtx,
        path: '/',
        body: `<head><script>const logtoSsr=${ssrPlaceholder};</script></head>`,
      };
      await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);

      // `</style`/`</STYLE` is broken to `<\/...`; the literal text after it (space/newline/`>`) is intact.
      expect(ctx.body).toContain(`content: "${variant.replace(/<\/(style)/i, '<\\/$1')}"`);
      expect(ctx.body).not.toMatch(/content: "<\/(?:style|STYLE)/);
    }
  );

  it('should escape characters in the SSR JSON so embedded data cannot break out of the <script>', async () => {
    (tenant.libraries.signInExperiences.getFullSignInExperience as jest.Mock).mockResolvedValueOnce(
      { ...mockSignInExperience, customContent: { '/sign-in': '</script>' } }
    );

    const ctx = {
      ...baseCtx,
      path: '/',
      body: `<head><script>const logtoSsr=${ssrPlaceholder};</script></head>`,
    };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);

    // The `</script>` carried in the SSR data must be emitted as `\u003c/script\u003e`,
    // never as a literal tag that would close the inline `window.logtoSsr` <script> early. Asserting the
    // escaped form (rather than counting `</script>` occurrences) is robust to the served template adding
    // its own <script> tags.
    expect(ctx.body).toContain('\\u003c/script\\u003e');
  });

  it('should produce SSR JSON that still parses back to the original data after escaping', async () => {
    (tenant.libraries.signInExperiences.getFullSignInExperience as jest.Mock).mockResolvedValueOnce(
      { ...mockSignInExperience, customContent: { '/sign-in': '<a>&</a>' } }
    );

    const ctx = {
      ...baseCtx,
      path: '/',
      body: `<head><script>const logtoSsr=${ssrPlaceholder};</script></head>`,
    };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);

    // The `\uXXXX` escapes must decode back to the original characters when parsed, so the escaping is
    // safe (no data corruption) while still preventing tag breakout.
    const serialized = /Object\.freeze\((?<json>.+)\)/.exec(ctx.body)?.groups?.json;
    expect(serialized).toBeTruthy();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test parses known JSON
    const parsed = JSON.parse(serialized!);
    expect(parsed.signInExperience.data.customContent['/sign-in']).toBe('<a>&</a>');
  });

  it('should not inline custom CSS in preview mode', async () => {
    (tenant.libraries.signInExperiences.getFullSignInExperience as jest.Mock).mockResolvedValueOnce(
      { ...mockSignInExperience, customCss: '.foo { color: red; }' }
    );

    const ctx = {
      ...baseCtx,
      path: '/',
      query: { preview: 'true' },
      body: `<head><script>const logtoSsr=${ssrPlaceholder};</script></head>`,
    };
    await koaExperienceSsr(tenant.libraries, tenant.queries)(ctx, next);

    // Preview is driven live by postMessage + react-helmet; the server must not inline saved CSS.
    expect(ctx.body).not.toContain('<style data-custom-css>');
  });
});
