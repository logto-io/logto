import { createMockContext } from '@shopify/jest-koa-mocks';
import type { ParameterizedContext } from 'koa';

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
