import { createMockPool, createMockQueryResult } from 'slonik';

import { mockSignInExperience } from '@/__mocks__';
import envSet from '@/env-set';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import { findDefaultSignInExperience, updateDefaultSignInExperience } from './sign-in-experience';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
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
    color: JSON.stringify(mockSignInExperience.color),
    branding: JSON.stringify(mockSignInExperience.branding),
    termsOfUse: JSON.stringify(mockSignInExperience.termsOfUse),
    languageInfo: JSON.stringify(mockSignInExperience.languageInfo),
    signIn: JSON.stringify(mockSignInExperience.signIn),
    signUp: JSON.stringify(mockSignInExperience.signUp),
    signInMethods: JSON.stringify(mockSignInExperience.socialSignInConnectorTargets),
    socialSignInConnectorTargets: JSON.stringify(mockSignInExperience.socialSignInConnectorTargets),
  };

  it('findDefaultSignInExperience', async () => {
    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      select "id", "color", "branding", "language_info", "terms_of_use", "sign_in_methods", "sign_in", "sign_up", "social_sign_in_connector_targets", "sign_in_mode", "forgot_password"
      from "sign_in_experiences"
      where "id"=$1
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
      set "terms_of_use"=$1
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
