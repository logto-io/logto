import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import { mockSignInExperience } from '#src/__mocks__/index.js';
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
    passwordPolicy: JSON.stringify(mockSignInExperience.passwordPolicy),
    mfa: JSON.stringify(mockSignInExperience.mfa),
    socialSignIn: JSON.stringify(mockSignInExperience.socialSignIn),
  };

  it('findDefaultSignInExperience', async () => {
    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      select "tenant_id", "id", "color", "branding", "language_info", "terms_of_use_url", "privacy_policy_url", "agree_to_terms_policy", "sign_in", "sign_up", "social_sign_in", "social_sign_in_connector_targets", "sign_in_mode", "custom_css", "custom_content", "custom_ui_asset_id", "password_policy", "mfa", "single_sign_on_enabled"
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
