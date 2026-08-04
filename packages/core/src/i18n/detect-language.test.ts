import type { ParameterizedContext } from 'koa';

import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import detectLanguage from './detect-language.js';

describe('detectLanguage', () => {
  it('detectLanguage with request header', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: {
        'accept-language': 'en,en-US;q=0.9',
      },
    });

    const language = detectLanguage(ctx);

    expect(language).toEqual(['en', 'en-US']);
  });

  it('detectLanguage with optional whitespace around the quality parameter', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock context does not need typed state or body.
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: {
        'accept-language': 'en; q=0.7, pl; q=0.9',
      },
    });

    const language = detectLanguage(ctx);

    expect(language).toEqual(['pl', 'en']);
  });

  it('detectLanguage with a non-numeric quality value', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock context does not need typed state or body.
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: {
        'accept-language': 'pl;q=0.9,en;q=high',
      },
    });

    const language = detectLanguage(ctx);

    expect(language).toEqual(['en', 'pl']);
  });

  it('return empty if non-language is detected', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: {
        'accept-language': '; q=0.9',
      },
    });

    const language = detectLanguage(ctx);

    expect(language.length).toEqual(0);
  });
});
