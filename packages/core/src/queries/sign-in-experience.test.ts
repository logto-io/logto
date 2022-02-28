import { SignInExperiences } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import { mockSignInExperience } from '@/utils/mock';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import { findDefaultSignInExperience, updateSignInExperienceById } from './sign-in-experience';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.mock('@/database/pool', () =>
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('sign-in-experience query', () => {
  const { table, fields } = convertToIdentifiers(SignInExperiences);
  const dbvalue = {
    ...mockSignInExperience,
    companyInfo: JSON.stringify(mockSignInExperience.companyInfo),
    branding: JSON.stringify(mockSignInExperience.branding),
    termsOfUse: JSON.stringify(mockSignInExperience.termsOfUse),
    localization: JSON.stringify(mockSignInExperience.localization),
    signInMethods: JSON.stringify(mockSignInExperience.signInMethods),
  };

  it('findDefaultSignInExperience', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(findDefaultSignInExperience()).resolves.toEqual(dbvalue);
  });

  it('updateSignInExperienceById', async () => {
    const id = 'foo';
    const termsOfUse = {
      enabled: false,
    };

    const expectSql = sql`
      update ${table}
      set
      ${fields.termsOfUse}=
      coalesce(${fields.termsOfUse},'{}'::jsonb)|| $1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([JSON.stringify(termsOfUse), id]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(updateSignInExperienceById(id, { termsOfUse })).resolves.toEqual(dbvalue);
  });
});
