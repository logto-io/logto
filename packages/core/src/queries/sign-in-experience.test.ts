import { createMockPool, createMockQueryResult } from 'slonik';

import { mockSignInExperience } from '@/__mocks__';
import envSet from '@/env-set';
import type { QueryType } from '@/utils/test-utils';
import { expectSqlAssert } from '@/utils/test-utils';

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
    termsOfUseUrl: mockSignInExperience.termsOfUseUrl,
    languageInfo: JSON.stringify(mockSignInExperience.languageInfo),
    signIn: JSON.stringify(mockSignInExperience.signIn),
    signUp: JSON.stringify(mockSignInExperience.signUp),
    socialSignInConnectorTargets: JSON.stringify(mockSignInExperience.socialSignInConnectorTargets),
  };

  it('findDefaultSignInExperience', async () => {
    /* eslint-disable sql/no-unsafe-query */
    const expectSql = `
      select "id", "color", "branding", "language_info", "terms_of_use_url", "sign_in", "sign_up", "social_sign_in_connector_targets", "sign_in_mode"
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
    const termsOfUseUrl = '';

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
      expect(values).toEqual([null, id]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(updateDefaultSignInExperience({ termsOfUseUrl })).resolves.toEqual(dbvalue);
  });
});
