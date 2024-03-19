import { SearchJointMode, SearchMatchMode } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';
import { yes, conditionalString, cond } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';
import { snakeCase } from 'snake-case';

import { type SearchOptions } from '#src/database/utils.js';

import assertThat from './assert-that.js';
import { isEnum } from './type.js';

const searchJointModes = Object.values(SearchJointMode);
const searchMatchModes = Object.values(SearchMatchMode);

type SearchItem = {
  mode: SearchMatchMode;
  field?: string;
  values: string[];
};

export type Search = {
  matches: SearchItem[];
  joint: SearchJointMode;
  isCaseSensitive: boolean;
};

/**
 * Parse a field string with "search." prefix to the actual first-level field.
 * If `allowedFields` is not `undefined`, ensure the parsed field is included in the list.
 *
 * Examples:
 *
 * ```ts
 * getSearchField('search.foo') // 'foo'
 * getSearchField('search.foo.bar') // TypeError
 * getSearchField('search.foo', ['bar']) // TypeError
 * getSearchField('search', ['bar']) // undefined
 * ```
 *
 * @param field The field string to check.
 * @param allowedFields Available search fields. Note the general field is always allowed.
 * @returns The actual search field string, `undefined` if it's a general field.
 */
const getSearchField = (field: string, allowedFields?: string[]): Optional<string> => {
  const path = field.split('.');

  assertThat(
    path.length <= 2,
    new TypeError(
      `Unsupported nested search field path \`${path
        .slice(1)
        .join('.')}\` detected. Only the first level field is supported.`
    )
  );

  if (allowedFields && path[1] && !allowedFields.includes(path[1])) {
    throw new TypeError(
      `Search field \`${path[1]}\` is not allowed. Expect one of ${allowedFields.join(', ')}.`
    );
  }

  return path[1];
};

const getJointMode = (value?: Nullable<string>): SearchJointMode => {
  if (!value) {
    return SearchJointMode.Or;
  }

  assertThat(
    isEnum(searchJointModes, value),
    new TypeError(
      `Search joint mode \`${value}\` is not valid, expect one of ${searchJointModes.join(', ')}.`
    )
  );

  return value;
};

// Use a mutating approach to improve performance
/* eslint-disable @silverhand/fp/no-mutating-methods */
const getSearchMetadata = (searchParameters: URLSearchParams, allowedFields?: string[]) => {
  const matchMode = new Map<Optional<string>, SearchMatchMode>();
  const matchValues = new Map<Optional<string>, string[]>();
  const joint = getJointMode(searchParameters.get('joint') ?? searchParameters.get('jointMode'));
  const isCaseSensitive = yes(searchParameters.get('isCaseSensitive') ?? 'false');

  // Parse the following values and return:
  // 1. Search modes per field, if available
  // 2. Search fields and values
  for (const [key, value] of searchParameters.entries()) {
    if (key.startsWith('mode')) {
      const field = getSearchField(key, allowedFields);

      assertThat(
        isEnum(searchMatchModes, value),
        new TypeError(
          `Search match mode \`${value}\`${conditionalString(
            field && ` for field \`${field}\``
          )} is not valid, expect one of ${searchMatchModes.join(', ')}.`
        )
      );

      matchMode.set(field, value);
      continue;
    }

    if (key.startsWith('search')) {
      const field = getSearchField(key, allowedFields);
      const values = matchValues.get(field) ?? [];

      values.push(value);
      matchValues.set(field, values);
      continue;
    }
  }

  return { joint, matchMode, matchValues, isCaseSensitive };
};

export const parseSearchParamsForSearch = (
  searchParams: URLSearchParams,
  allowedFields?: string[]
): Search => {
  const { matchMode, matchValues, ...rest } = getSearchMetadata(searchParams, allowedFields);

  // Validate and generate result
  const matches: SearchItem[] = [];
  const result: Search = {
    matches,
    ...rest,
  };

  const getModeFor = (field: Optional<string>): SearchMatchMode =>
    // eslint-disable-next-line unicorn/no-useless-undefined
    matchMode.get(field) ?? matchMode.get(undefined) ?? SearchMatchMode.Like;

  for (const [field, values] of matchValues.entries()) {
    const mode = getModeFor(field);

    if (mode === SearchMatchMode.Exact) {
      assertThat(values.every(Boolean), new TypeError('Search value cannot be empty.'));
    } else {
      assertThat(
        values.length === 1,
        new TypeError('Only one search value is allowed when search mode is not `exact`.')
      );
      assertThat(values[0], new TypeError('Search value cannot be empty.'));
    }

    matches.push({ mode, field, values });
  }

  return result;
};
/* eslint-enable @silverhand/fp/no-mutating-methods */

const getJointModeSql = (mode: SearchJointMode) => {
  switch (mode) {
    case SearchJointMode.And: {
      return sql` and `;
    }

    case SearchJointMode.Or: {
      return sql` or `;
    }
  }
};

const getMatchModeOperator = (match: SearchMatchMode, isCaseSensitive: boolean) => {
  switch (match) {
    case SearchMatchMode.Exact: {
      return sql`=`;
    }

    case SearchMatchMode.Like: {
      return isCaseSensitive ? sql`~~` : sql`~~*`;
    }

    case SearchMatchMode.SimilarTo: {
      assertThat(
        isCaseSensitive,
        new TypeError('Cannot use case-insensitive match for `similar to`.')
      );

      return sql`similar to`;
    }

    case SearchMatchMode.Posix: {
      return isCaseSensitive ? sql`~` : sql`~*`;
    }
  }
};

const validateAndBuildValueExpression = (
  rawValues: string[],
  field: string,
  shouldLowercase: boolean
) => {
  const values = shouldLowercase ? rawValues.map((rawValue) => rawValue.toLowerCase()) : rawValues;

  // Type check for the first value
  assertThat(
    values[0] && values.every(Boolean),
    new TypeError(`Empty value found${conditionalString(field && ` for field ${field}`)}.`)
  );

  const valueExpression =
    values.length === 1 ? sql`${values[0]}` : sql`any(${sql.array(values, 'varchar')})`;

  return valueExpression;
};

/**
 * Build search SQL token by parsing the search object and available search fields.
 * Note all `field`s will be normalized to snake case, so camel case fields are valid.
 *
 * @param search The search config object.
 * @param searchFields Allowed and default search fields (columns).
 * @returns The SQL token that includes the all condition checks.
 * @throws TypeError error if fields in `search` do not match the `searchFields`, or invalid condition found (e.g. the value is empty).
 */
export const buildConditionsFromSearch = (search: Search, searchFields: readonly string[]) => {
  assertThat(searchFields.length > 0, new TypeError('No search field found.'));

  const { matches, joint, isCaseSensitive } = search;
  const conditions = matches.map(({ mode, field: rawField, values }) => {
    const field = rawField && snakeCase(rawField);

    if (field && !searchFields.includes(field)) {
      throw new TypeError(
        `Search field \`${field}\` is not valid, expect one of ${searchFields.join(', ')}.`
      );
    }

    const shouldLowercase = !isCaseSensitive && mode === SearchMatchMode.Exact;
    const fields = field ? [field] : searchFields;

    const getValueExpressionFor = (fieldName: string, shouldLowercase: boolean) =>
      validateAndBuildValueExpression(values, fieldName, shouldLowercase);

    return sql`(${sql.join(
      fields.map(
        (field) =>
          sql`${
            shouldLowercase ? sql`lower(${sql.identifier([field])})` : sql.identifier([field])
          } ${getMatchModeOperator(mode, isCaseSensitive)} ${getValueExpressionFor(
            field,
            shouldLowercase
          )}`
      ),
      sql` or `
    )})`;
  });

  if (conditions.length === 0) {
    return sql``;
  }

  return sql.join(conditions, getJointModeSql(joint));
};

/**
 * Parse the search query from the request query string and build the search options
 * for certain search fields.
 *
 * @param searchFields Search fields to be included in the search options.
 * @param guardedQuery The guarded query key-value object.
 * @returns The search options object, or `undefined` if no search query is found.
 */
export const parseSearchOptions = <Key extends string>(
  searchFields: readonly Key[],
  guardedQuery: {
    q?: string;
  }
): Optional<SearchOptions<Key>> => {
  const { q } = guardedQuery;
  return cond(
    q &&
      searchFields.length > 0 && {
        fields: searchFields,
        keyword: q,
      }
  );
};
