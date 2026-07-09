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
    customUiCsp: JSON.stringify(mockSignInExperience.customUiCsp),
    passwordPolicy: JSON.stringify(mockSignInExperience.passwordPolicy),
    passwordExpiration: JSON.stringify(mockSignInExperience.passwordExpiration),
    mfa: JSON.stringify(mockSignInExperience.mfa),
    adaptiveMfa: JSON.stringify(mockSignInExperience.adaptiveMfa),
    socialSignIn: JSON.stringify(mockSignInExperience.socialSignIn),
    captchaPolicy: JSON.stringify(mockSignInExperience.captchaPolicy),
    sentinelPolicy: JSON.stringify(mockSignInExperience.sentinelPolicy),
    verificationCodePolicy: JSON.stringify(mockSignInExperience.verificationCodePolicy),
    emailBlocklistPolicy: JSON.stringify(mockSignInExperience.emailBlocklistPolicy),
    emailAllowlistPolicy: JSON.stringify(mockSignInExperience.emailAllowlistPolicy),
    forgotPasswordMethods: JSON.stringify(mockSignInExperience.forgotPasswordMethods),
    passkeySignIn: JSON.stringify(mockSignInExperience.passkeySignIn),
    signUpProfileFields: JSON.stringify(mockSignInExperience.signUpProfileFields),
    usernamePolicy: JSON.stringify(mockSignInExperience.usernamePolicy),
  };

  it('findDefaultSignInExperience', async () => {
    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      select "tenant_id", "id", "color", "branding", "hide_logto_branding", "language_info", "terms_of_use_url", "privacy_policy_url", "agree_to_terms_policy", "sign_in", "sign_up", "social_sign_in", "social_sign_in_connector_targets", "sign_in_mode", "custom_css", "custom_content", "custom_ui_assets", "custom_ui_csp", "password_policy", "mfa", "adaptive_mfa", "single_sign_on_enabled", "support_email", "support_website_url", "unknown_session_redirect_url", "captcha_policy", "sentinel_policy", "email_blocklist_policy", "email_allowlist_policy", "verification_code_policy", "forgot_password_methods", "passkey_sign_in", "sign_up_profile_fields", "password_expiration", "username_policy"
      from "sign_in_experiences"
      where "id"=$1
    `;
    /* eslint-enable sql/no-unsafe-query */

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);
      expect(values).toEqual([id]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findDefaultSignInExperience()).resolves.toEqual(databaseValue);
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

    await expect(updateDefaultSignInExperience({ termsOfUseUrl })).resolves.toEqual(databaseValue);
  });
});

describe('getUsernameCaseSensitive', () => {
  const originalIsCaseSensitiveUsername = EnvSet.values.isCaseSensitiveUsername;

  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore env override after each case
    (EnvSet.values as { isCaseSensitiveUsername: boolean }).isCaseSensitiveUsername =
      originalIsCaseSensitiveUsername;
  });

  it.each([
    [true, true, true],
    [true, false, false],
    [false, true, false],
    [false, false, false],
  ])(
    'policy caseSensitive=%s AND env=%s resolves to %s',
    async (policyCaseSensitive, envCaseSensitive, expected) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- toggle the legacy env var for this case
      (EnvSet.values as { isCaseSensitiveUsername: boolean }).isCaseSensitiveUsername =
        envCaseSensitive;
      // Fresh instance so the memoized findDefaultSignInExperience isn't shared across cases.
      const { getUsernameCaseSensitive } = createSignInExperienceQueries(
        pool,
        new MockWellKnownCache()
      );
      mockQuery.mockImplementationOnce(async () =>
        // @ts-expect-error -- the mock returns a pre-parsed SIE row; createMockQueryResult's primitive row type can't express the jsonb object the resolver reads
        createMockQueryResult([{ usernamePolicy: { caseSensitive: policyCaseSensitive } }])
      );

      expect(await getUsernameCaseSensitive()).toBe(expected);
    }
  );
});
