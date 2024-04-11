import { SearchJointMode, SearchMatchMode } from '@logto/schemas';
import type { ListSqlToken, TaggedTemplateLiteralInvocation } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

// Will add `params` to the exception list

import { buildConditionsFromSearch, parseSearchParamsForSearch } from './search.js';
import { expectSqlAssert, expectSqlTokenAssert } from './test-utils.js';

describe('parseSearchParamsForSearch()', () => {
  it('should throw when input is not valid', () => {
    expect(() => parseSearchParamsForSearch(new URLSearchParams([['joint', 'foo']]))).toThrowError(
      /is not valid/
    );
    expect(() => parseSearchParamsForSearch(new URLSearchParams([['mode', 'foo']]))).toThrowError(
      /is not valid/
    );
    expect(() =>
      parseSearchParamsForSearch(new URLSearchParams([['mode.foo', 'foo']]))
    ).toThrowError(/is not valid/);
    expect(() =>
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'like'],
          ['search', 'foo'],
          ['search', 'bar'],
        ])
      )
    ).toThrowError(/Only one search value/);
    expect(() =>
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'like'],
          ['search', ''],
        ])
      )
    ).toThrowError(/cannot be empty/);
    expect(() =>
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'exact'],
          ['search', ''],
          ['search', 'bar'],
        ])
      )
    ).toThrowError(/cannot be empty/);
    expect(() =>
      parseSearchParamsForSearch(new URLSearchParams([['search.foo.bar', 'baz']]))
    ).toThrowError(/nested search field path/);
    expect(() =>
      parseSearchParamsForSearch(new URLSearchParams([['search.foo', 'baz']]), ['bar'])
    ).toThrowError(/is not allowed/);
  });

  it('should return proper result', () => {
    expect(
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'exact'],
          ['search', 'foo'],
          ['search.foo', 'bar%'],
          ['search.bar', 'baz'],
          ['mode.foo', 'like'],
          ['isCaseSensitive', 'true'],
        ])
      )
    ).toStrictEqual({
      matches: [
        { mode: SearchMatchMode.Exact, field: undefined, values: ['foo'] },
        { mode: SearchMatchMode.Like, field: 'foo', values: ['bar%'] },
        { mode: SearchMatchMode.Exact, field: 'bar', values: ['baz'] },
      ],
      joint: SearchJointMode.Or,
      isCaseSensitive: true,
    });

    expect(
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['joint', 'and'],
          ['search', 'foo'],
          ['search.foo', 'bar'],
        ]),
        ['foo', 'bar']
      )
    ).toStrictEqual({
      matches: [
        { mode: SearchMatchMode.Like, field: undefined, values: ['foo'] },
        { mode: SearchMatchMode.Like, field: 'foo', values: ['bar'] },
      ],
      joint: SearchJointMode.And,
      isCaseSensitive: false,
    });
  });
});

describe('buildConditionsFromSearch()', () => {
  const defaultSearch = { matches: [], isCaseSensitive: false, joint: SearchJointMode.Or };
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getSql = (token: ListSqlToken | TaggedTemplateLiteralInvocation) => sql`${token}`;

  it('should throw error when no search field found', () => {
    expect(() => buildConditionsFromSearch(defaultSearch, [])).toThrowError(TypeError);
  });

  it('should throw when conditions has invalid field', () => {
    expect(() =>
      buildConditionsFromSearch(
        {
          ...defaultSearch,
          matches: [
            { mode: SearchMatchMode.Exact, field: 'primaryPhone', values: ['foo'] },
            { mode: SearchMatchMode.Exact, field: 'foo', values: ['foo'] },
          ],
        },
        ['id', 'primary_phone']
      )
    ).toThrowError(/`foo` is not valid/);
  });

  it('should throw when value is empty', () => {
    expect(() =>
      buildConditionsFromSearch(
        {
          ...defaultSearch,
          matches: [{ mode: SearchMatchMode.Exact, field: 'primaryPhone', values: ['foo', ''] }],
        },
        ['id', 'primary_phone']
      )
    ).toThrowError(/empty value found/i);
  });

  it('should throw when case insensitive but conditions include `similar to`', () => {
    expect(() =>
      buildConditionsFromSearch(
        {
          ...defaultSearch,
          matches: [
            { mode: SearchMatchMode.Exact, field: 'primaryPhone', values: ['foo'] },
            { mode: SearchMatchMode.SimilarTo, field: 'primaryPhone', values: ['t.*ma'] },
          ],
          isCaseSensitive: false,
        },
        ['id', 'primary_phone']
      )
    ).toThrowError(/cannot use /i);
  });

  it('should return expected SQL', () => {
    expectSqlAssert(getSql(buildConditionsFromSearch(defaultSearch, ['id', 'username'])).sql, '');

    expectSqlTokenAssert(
      getSql(
        buildConditionsFromSearch(
          { ...defaultSearch, matches: [{ mode: SearchMatchMode.Like, values: ['foo'] }] },
          ['id', 'username']
        )
      ),
      '("id" ~~* $1 or "username" ~~* $2)',
      ['foo', 'foo']
    );

    expectSqlTokenAssert(
      getSql(
        buildConditionsFromSearch(
          {
            matches: [
              { mode: SearchMatchMode.Exact, field: 'userId', values: ['FOO', 'baR'] },
              { mode: SearchMatchMode.Like, values: ['t.*ma'] },
              { mode: SearchMatchMode.Posix, field: 'username', values: ['^(b|c)'] },
            ],
            joint: SearchJointMode.And,
            isCaseSensitive: false,
          },
          ['user_id', 'username']
        )
      ),
      '(lower("user_id") = any($1::"varchar"[])) and ("user_id" ~~* $2 or "username" ~~* $3) and ("username" ~* $4)',
      [['foo', 'bar'], 't.*ma', 't.*ma', '^(b|c)']
    );

    expectSqlTokenAssert(
      getSql(
        buildConditionsFromSearch(
          {
            matches: [
              { mode: SearchMatchMode.Exact, field: 'userId', values: ['FOO', 'baR'] },
              { mode: SearchMatchMode.SimilarTo, values: ['t.*ma'] },
              { mode: SearchMatchMode.Like, field: 'user_id', values: ['tma'] },
              { mode: SearchMatchMode.Posix, values: ['^(b|c)'] },
            ],
            joint: SearchJointMode.And,
            isCaseSensitive: true,
          },
          ['user_id', 'username']
        )
      ),
      '("user_id" = any($1::"varchar"[]))' +
        ' and ' +
        '("user_id" similar to $2 or "username" similar to $3)' +
        ' and ' +
        '("user_id" ~~ $4)' +
        ' and ' +
        '("user_id" ~ $5 or "username" ~ $6)',
      [['FOO', 'baR'], 't.*ma', 't.*ma', 'tma', '^(b|c)', '^(b|c)']
    );
  });
});
