import { SearchJointMode, SearchMatchMode } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';
import { conditionalString } from '@silverhand/essentials';
import { sql } from 'slonik';
import { snakeCase } from 'snake-case';

import { isTrue } from '#src/env-set/parameters.js';

const searchJointModes = Object.values(SearchJointMode);
const searchMatchModes = Object.values(SearchMatchMode);

export type SearchItem = {
  mode: SearchMatchMode;
  field?: string;
  values: string[];
};

export type Search = {
  matches: SearchItem[];
  joint: SearchJointMode;
  isCaseSensitive: boolean;
};

const isEnum = <T extends string>(list: T[], value: string): value is T =>
  // @ts-expect-error the easiest way to perform type checking for a string enum
  list.includes(value);

const getSearchField = (field: string, allowedFields?: string[]): Optional<string> => {
  const path = field.split('.');

  if (path.length > 2) {
    throw new TypeError(
      `Unsupported nested search field path \`${path
        .slice(1)
        .join('.')}\` detected. Only the first level field is supported.`
    );
  }

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

  if (!isEnum(searchJointModes, value)) {
    throw new TypeError(
      `Search joint mode \`${value}\` is not valid, expect one of ${searchJointModes.join(', ')}.,`
    );
  }

  return value;
};

// Use a mutating approach to improve performance
/* eslint-disable @silverhand/fp/no-mutating-methods */
const getSearchMetadata = (searchParameters: URLSearchParams, allowedFields?: string[]) => {
  const matchMode = new Map<Optional<string>, SearchMatchMode>();
  const matchValues = new Map<Optional<string>, string[]>();
  const joint = getJointMode(searchParameters.get('joint') ?? searchParameters.get('jointMode'));
  const isCaseSensitive = isTrue(searchParameters.get('isCaseSensitive') ?? 'false');

  // Parse the following values and return:
  // 1. Search modes per field, if available
  // 2. Search fields and values
  for (const [key, value] of searchParameters.entries()) {
    if (key.startsWith('mode')) {
      const field = getSearchField(key, allowedFields);

      if (!isEnum(searchMatchModes, value)) {
        throw new TypeError(
          `Search match mode \`${value}\`${conditionalString(
            field && ` for field \`${field}\``
          )} is not valid, expect one of ${searchMatchModes.join(', ')}.`
        );
      }
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

/* eslint-disable unicorn/prevent-abbreviations */
export const parseSearchParamsForSearch = (
  searchParams: URLSearchParams,
  allowedFields?: string[]
): Search => {
  /* eslint-enable unicorn/prevent-abbreviations */
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
      if (!values.every(Boolean)) {
        throw new TypeError('Search value cannot be empty.');
      }
    } else {
      if (values.length !== 1) {
        throw new TypeError('Only one search value is allowed when search mode is not `exact`.');
      }

      if (!values[0]) {
        throw new TypeError('Search value cannot be empty.');
      }
    }

    matches.push({ mode, field, values });
  }

  return result;
};
/* eslint-enable @silverhand/fp/no-mutating-methods */

const getJointModeSql = (mode: SearchJointMode) => {
  switch (mode) {
    case SearchJointMode.And:
      return sql` and `;
    case SearchJointMode.Or:
      return sql` or `;
  }
};

const getMatchModeOperator = (match: SearchMatchMode, isCaseSensitive: boolean) => {
  switch (match) {
    case SearchMatchMode.Exact:
      return sql`=`;
    case SearchMatchMode.Like:
      return isCaseSensitive ? sql`~~` : sql`~~*`;
    case SearchMatchMode.SimilarTo:
      if (!isCaseSensitive) {
        throw new TypeError('Cannot use case-insensitive match for `similar to`.');
      }

      return sql`similar to`;
    case SearchMatchMode.Posix:
      return isCaseSensitive ? sql`~` : sql`~*`;
  }
};

/**
 * Build search SQL token by parsing the search object and available search fields.
 * Note all `field`s will be normalized to snake case, so camel case fields are valid.
 *
 * @param search The search config object.
 * @param searchFields Allowed and default search fields (columns).
 * @param isCaseSensitive Should perform case sensitive search or not.
 * @returns The SQL token that includes the all condition checks.
 * @throws TypeError error if fields in `search` do not match the `searchFields`, or invalid condition found (e.g. the value is empty).
 */
export const buildConditionsFromSearch = (search: Search, searchFields: string[]) => {
  if (searchFields.length === 0) {
    throw new TypeError('No search field found.');
  }

  const { matches, joint, isCaseSensitive } = search;
  const conditions = matches.map(({ mode, field: rawField, values: rawValues }) => {
    const field = rawField && snakeCase(rawField);

    if (field && !searchFields.includes(field)) {
      throw new TypeError(
        `Search field \`${field}\` is not valid, expect one of ${searchFields.join(', ')}.`
      );
    }

    const shouldLowercase = !isCaseSensitive && mode === SearchMatchMode.Exact;
    const fields = field ? [field] : searchFields;
    const values = shouldLowercase ? rawValues.map((value) => value.toLowerCase()) : rawValues;

    // Type check for the first value
    if (!values[0] || !values.every(Boolean)) {
      throw new TypeError(`Empty value found${conditionalString(field && ` for field ${field}`)}.`);
    }

    const valueExpression =
      values.length === 1 ? sql`${values[0]}` : sql`any(${sql.array(values, 'varchar')})`;

    return sql`(${sql.join(
      fields.map(
        (field) =>
          sql`${
            shouldLowercase ? sql`lower(${sql.identifier([field])})` : sql.identifier([field])
          } ${getMatchModeOperator(mode, isCaseSensitive)} ${valueExpression}`
      ),
      sql` or `
    )})`;
  });

  if (conditions.length === 0) {
    return sql``;
  }

  return sql.join(conditions, getJointModeSql(joint));
};
