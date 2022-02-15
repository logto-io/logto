import { createMockContext } from '@shopify/jest-koa-mocks';
import { ParameterizedContext } from 'koa';

import detectLanguage from './detect-language';

describe('detectLanguage', () => {
  it('detectLanguage with request header', () => {
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: {
        'accept-language': 'en,en-US;q=0.9',
      },
    });

    const language = detectLanguage(ctx);

    expect(language).toEqual(['en', 'en-US']);
  });

  it('return empty if non-language is detected', () => {
    const ctx: ParameterizedContext<any, any, any> = createMockContext({
      headers: {
        'accept-language': '; q=0.9',
      },
    });

    const language = detectLanguage(ctx);

    expect(language.length).toEqual(0);
  });
});
