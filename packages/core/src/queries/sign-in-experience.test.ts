import { MfaPolicy, mfaGuard } from '@logto/schemas';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import { mockSignInExperience } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createSignInExperienceQueries } = await import('./sign-in-experience.js');
const { findDefaultSignInExperience, updateDefaultSignInExperience } =
  createSignInExperienceQueries(pool, new MockWellKnownCache());

describe('sign-in-experience query', () => {
  const id = 'default';

  const databaseValue = {
    ...mockSignInExperience,
    color: JSON.stringify(mockSignInExperience.color),
    branding: JSON.stringify(mockSignInExperience.branding),
    termsOfUseUrl: mockSignInExperience.termsOfUseUrl,
    languageInfo: JSON.stringify(mockSignInExperience.languageInfo),
    signIn: JSON.stringify(mockSignInExperience.signIn),
    signUp: JSON.stringify(mockSignInExperience.signUp),
    socialSignInConnectorTargets: JSON.stringify(mockSignInExperience.socialSignInConnectorTargets),
    customContent: JSON.stringify(mockSignInExperience.customContent),
    customUiAssets: JSON.stringify(mockSignInExperience.customUiAssets),
    passwordPolicy: JSON.stringify(mockSignInExperience.passwordPolicy),
    mfa: JSON.stringify(mockSignInExperience.mfa),
    adaptiveMfa: JSON.stringify(mockSignInExperience.adaptiveMfa),
    socialSignIn: JSON.stringify(mockSignInExperience.socialSignIn),
    captchaPolicy: JSON.stringify(mockSignInExperience.captchaPolicy),
    sentinelPolicy: JSON.stringify(mockSignInExperience.sentinelPolicy),
    emailBlocklistPolicy: JSON.stringify(mockSignInExperience.emailBlocklistPolicy),
    forgotPasswordMethods: JSON.stringify(mockSignInExperience.forgotPasswordMethods),
    passkeySignIn: JSON.stringify(mockSignInExperience.passkeySignIn),
  };

  const legacyMandatoryDatabaseValue = {
    ...databaseValue,
    mfa: JSON.stringify({
      ...mockSignInExperience.mfa,
      policy: MfaPolicy.Mandatory,
    }),
  };

  const expectNormalizedMfa = (
    value: string | (typeof mockSignInExperience)['mfa'],
    policy: MfaPolicy = mockSignInExperience.mfa.policy
  ) => {
    const parsedValue = typeof value === 'string' ? mfaGuard.parse(JSON.parse(value)) : value;

    expect(parsedValue).toEqual({
      ...mockSignInExperience.mfa,
      policy,
    });
  };

  const { mfa: _databaseMfa, ...databaseValueWithoutMfa } = databaseValue;
  const { mfa: _legacyMandatoryDatabaseMfa, ...legacyMandatoryDatabaseValueWithoutMfa } =
    legacyMandatoryDatabaseValue;

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  it('findDefaultSignInExperience', async () => {
    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      select "tenant_id", "id", "color", "branding", "hide_logto_branding", "language_info", "terms_of_use_url", "privacy_policy_url", "agree_to_terms_policy", "sign_in", "sign_up", "social_sign_in", "social_sign_in_connector_targets", "sign_in_mode", "custom_css", "custom_content", "custom_ui_assets", "password_policy", "mfa", "adaptive_mfa", "single_sign_on_enabled", "support_email", "support_website_url", "unknown_session_redirect_url", "captcha_policy", "sentinel_policy", "email_blocklist_policy", "forgot_password_methods", "passkey_sign_in"
      from "sign_in_experiences"
      where "id"=$1
    `;
    /* eslint-enable sql/no-unsafe-query */

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);
      expect(values).toEqual([id]);

      return createMockQueryResult([databaseValue]);
    });

    const result = await findDefaultSignInExperience();

    expect(result).toMatchObject({
      ...databaseValueWithoutMfa,
    });
    expectNormalizedMfa(result.mfa);
  });

  it('findDefaultSignInExperience should normalize legacy mandatory mfa policy', async () => {
    mockQuery.mockImplementationOnce(async () =>
      createMockQueryResult([legacyMandatoryDatabaseValue])
    );

    const result = await findDefaultSignInExperience();

    expect(result).toMatchObject({
      ...legacyMandatoryDatabaseValueWithoutMfa,
    });
    expectNormalizedMfa(result.mfa, MfaPolicy.PromptAtSignInAndSignUpMandatory);
  });

  it('findDefaultSignInExperience should keep no-skip policy when adaptive mfa is enabled in legacy mode', async () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    mockQuery.mockImplementationOnce(async () =>
      createMockQueryResult([
        {
          ...databaseValue,
          mfa: JSON.stringify({
            ...mockSignInExperience.mfa,
            policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
            factors: [],
          }),
          adaptiveMfa: JSON.stringify({
            enabled: true,
          }),
        },
      ])
    );

    const result = await findDefaultSignInExperience();

    expectNormalizedMfa(result.mfa, MfaPolicy.PromptAtSignInAndSignUpMandatory);
  });

  it('updateDefaultSignInExperience', async () => {
    const { termsOfUseUrl } = mockSignInExperience;

    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      update "sign_in_experiences"
      set "terms_of_use_url"=$1
      where "id"=$2
      returning *
    `;
    /* eslint-enable sql/no-unsafe-query */

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);
      expect(values).toEqual([termsOfUseUrl, id]);

      return createMockQueryResult([databaseValue]);
    });

    const result = await updateDefaultSignInExperience({ termsOfUseUrl });

    expect(result).toMatchObject({
      ...databaseValueWithoutMfa,
    });
    expectNormalizedMfa(result.mfa);
  });

  it('updateDefaultSignInExperience should normalize legacy mandatory mfa policy in response', async () => {
    mockQuery.mockImplementationOnce(async () =>
      createMockQueryResult([legacyMandatoryDatabaseValue])
    );

    const result = await updateDefaultSignInExperience({
      mfa: {
        ...mockSignInExperience.mfa,
        policy: MfaPolicy.Mandatory,
      },
    });

    expect(result).toMatchObject({
      ...legacyMandatoryDatabaseValueWithoutMfa,
    });
    expectNormalizedMfa(result.mfa, MfaPolicy.PromptAtSignInAndSignUpMandatory);
  });
});
