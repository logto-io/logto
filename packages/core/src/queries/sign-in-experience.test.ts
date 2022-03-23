import { createMockPool, createMockQueryResult } from 'slonik';

import { mockSignInExperience } from '@/utils/mock';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import { findDefaultSignInExperience, updateDefaultSignInExperience } from './sign-in-experience';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.mock('@/database/pool', () =>
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('sign-in-experience query', () => {
  const id = 'default';

  const dbvalue = {
    ...mockSignInExperience,
    branding: JSON.stringify(mockSignInExperience.branding),
    termsOfUse: JSON.stringify(mockSignInExperience.termsOfUse),
    languageInfo: JSON.stringify(mockSignInExperience.languageInfo),
    signInMethods: JSON.stringify(mockSignInExperience.socialSignInConnectorIds),
    socialSignInConnectorIds: JSON.stringify(mockSignInExperience.socialSignInConnectorIds),
  };

  it('findDefaultSignInExperience', async () => {
    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      select "id", "branding", "language_info", "terms_of_use", "forget_password_enabled", "sign_in_methods", "social_sign_in_connector_ids"
      from "sign_in_experiences"
      where "id" = $1
    `;
    /* eslint-enable sql/no-unsafe-query */

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);
      expect(values).toEqual([id]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(findDefaultSignInExperience()).resolves.toEqual(dbvalue);
  });

  it('updateDefaultSignInExperience', async () => {
    const termsOfUse = {
      enabled: false,
    };

    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      update "sign_in_experiences"
      set
      "terms_of_use"=
      coalesce("terms_of_use",'{}'::jsonb)|| $1
      where "id"=$2
      returning *
    `;
    /* eslint-enable sql/no-unsafe-query */

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);
      expect(values).toEqual([JSON.stringify(termsOfUse), id]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(updateDefaultSignInExperience({ termsOfUse })).resolves.toEqual(dbvalue);
  });
});
