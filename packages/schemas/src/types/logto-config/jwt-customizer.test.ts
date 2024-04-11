import { pick } from '@silverhand/essentials';
import { describe, it, expect } from 'vitest';

import {
  accessTokenJwtCustomizerGuard,
  clientCredentialsJwtCustomizerGuard,
} from './jwt-customizer.js';

const allFields = ['script', 'environmentVariables', 'contextSample', 'tokenSample'] as const;

const testClientCredentialsTokenPayload = {
  script: '',
  environmentVariables: {},
  contextSample: {},
  tokenSample: {},
};

const testAccessTokenPayload = {
  ...testClientCredentialsTokenPayload,
  contextSample: {
    user: {
      id: '123',
      username: 'foo',
      primaryEmail: 'foo@logto.io',
      primaryPhone: '+1234567890',
      name: 'Foo Bar',
      avatar: 'https://example.com/avatar.png',
      customData: {},
      identities: {},
      profile: {},
      applicationId: 'my-app',
      ssoIdentities: [],
      mfaVerificationFactors: [],
      roles: [],
      organizations: [],
      organizationRoles: [],
    },
  },
};

describe('test token sample guard', () => {
  it.each(allFields)('should pass guard with any of the field not specified', (droppedField) => {
    const resultAccessToken = accessTokenJwtCustomizerGuard.safeParse(
      pick(testAccessTokenPayload, ...allFields.filter((field) => field !== droppedField))
    );
    if (!resultAccessToken.success) {
      console.log('resultAccessToken.error', resultAccessToken.error);
    }
    expect(resultAccessToken.success).toBe(true);

    const resultClientCredentials = clientCredentialsJwtCustomizerGuard.safeParse(
      pick(
        testClientCredentialsTokenPayload,
        ...allFields.filter((field) => field !== droppedField)
      )
    );
    if (!resultClientCredentials.success) {
      console.log('resultClientCredentials.error', resultClientCredentials.error);
    }
    expect(resultClientCredentials.success).toBe(true);
  });

  it.each(allFields)(
    'should pass partial guard with any of the field not specified',
    (droppedField) => {
      const resultAccessToken = accessTokenJwtCustomizerGuard
        .partial()
        .safeParse(
          pick(testAccessTokenPayload, ...allFields.filter((field) => field !== droppedField))
        );
      expect(resultAccessToken.success).toBe(true);

      const resultClientCredentials = clientCredentialsJwtCustomizerGuard
        .partial()
        .safeParse(
          pick(
            testClientCredentialsTokenPayload,
            ...allFields.filter((field) => field !== droppedField)
          )
        );
      expect(resultClientCredentials.success).toBe(true);
    }
  );

  it('should throw when unwanted fields presented (access token)', () => {
    const result = accessTokenJwtCustomizerGuard.safeParse({
      ...testAccessTokenPayload,
      abc: 'abc',
    });
    expect(result.success).toBe(false);
  });

  it('should throw when unwanted fields presented (client credentials token)', () => {
    const result = clientCredentialsJwtCustomizerGuard.safeParse({
      ...testClientCredentialsTokenPayload,
      abc: 'abc',
    });
    expect(result.success).toBe(false);
  });
});
