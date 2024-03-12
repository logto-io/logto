import { pick } from '@silverhand/essentials';

import { jwtCustomizerAccessTokenGuard, jwtCustomizerClientCredentialsGuard } from './index.js';

const allFields = ['script', 'envVars', 'contextSample', 'tokenSample'] as const;

const testTokenPayload = {
  script: '',
  envVars: {},
  contextSample: {},
  tokenSample: {},
};

describe('test token sample guard', () => {
  it.each(allFields)('should pass guard with any of the field not specified', (droppedField) => {
    const resultAccessToken = jwtCustomizerAccessTokenGuard.safeParse(
      pick(testTokenPayload, ...allFields.filter((field) => field !== droppedField))
    );
    expect(resultAccessToken.success).toBe(true);

    const resultClientCredentials = jwtCustomizerClientCredentialsGuard.safeParse(
      pick(testTokenPayload, ...allFields.filter((field) => field !== droppedField))
    );
    expect(resultClientCredentials.success).toBe(true);
  });

  it.each(allFields)(
    'should pass partial guard with any of the field not specified',
    (droppedField) => {
      const resultAccessToken = jwtCustomizerAccessTokenGuard
        .partial()
        .safeParse(pick(testTokenPayload, ...allFields.filter((field) => field !== droppedField)));
      expect(resultAccessToken.success).toBe(true);

      const resultClientCredentials = jwtCustomizerClientCredentialsGuard
        .partial()
        .safeParse(pick(testTokenPayload, ...allFields.filter((field) => field !== droppedField)));
      expect(resultClientCredentials.success).toBe(true);
    }
  );

  it.each([jwtCustomizerAccessTokenGuard, jwtCustomizerClientCredentialsGuard])(
    'should throw when unwanted fields presented',
    (guard) => {
      const result = guard.safeParse({ ...testTokenPayload, abc: 'abc' });
      expect(result.success).toBe(false);
    }
  );

  it.each([jwtCustomizerAccessTokenGuard, jwtCustomizerClientCredentialsGuard])(
    'should throw when unwanted fields presented (with partial guard)',
    (guard) => {
      const result = guard.partial().safeParse({ ...testTokenPayload, abc: 'abc' });
      expect(result.success).toBe(false);
    }
  );
});
