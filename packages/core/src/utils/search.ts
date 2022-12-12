import { SearchJointMode, SearchMatchMode } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { conditionalString } from '@silverhand/essentials';

const searchJointModes = Object.values(SearchJointMode);
const searchMatchModes = Object.values(SearchMatchMode);

export type SearchItem<
  MatchMode extends SearchMatchMode = SearchMatchMode,
  Key extends string = string
> = {
  mode: MatchMode;
  key?: Key;
  value: MatchMode extends SearchMatchMode.Exact ? string[] : string;
};

export type Search = {
  matches: SearchItem[];
  joint: SearchJointMode;
};

const isEnum = <T extends string>(list: T[], value: string): value is T =>
  // @ts-expect-error the easiest way to perform type checking for a string enum
  list.includes(value);

const getSearchColumn = (key: string, allowedKeys?: string[]): Optional<string> => {
  const path = key.split('.');

  if (path.length > 2) {
    throw new TypeError(
      `Unsupported nested search keys \`${path
        .slice(1)
        .join('.')}\` detected. Only the first level key is supported.`
    );
  }

  if (allowedKeys && path[1] && !allowedKeys.includes(path[1])) {
    throw new TypeError(
      `Search key \`${path[1]}\` is not allowed. Expect one of ${allowedKeys.join(', ')}.`
    );
  }

  return path[1];
};

// Use a mutating approach to improve performance
/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-let, @silverhand/fp/no-mutating-methods */
const getSearchMetadata = <Keys extends string[] = string[]>(
  searchParameters: URLSearchParams,
  allowedKeys?: Keys
) => {
  type Key = Keys[number];
  const matchMode = new Map<Optional<Key>, SearchMatchMode>();
  const matchValues = new Map<Optional<Key>, string[]>();
  let joint = SearchJointMode.Or;

  // Parse the following values and return:
  // 1. global joint mode
  // 2. search modes per key, if available
  // 3. search keys and values
  for (const [key, value] of searchParameters.entries()) {
    if (key === 'joint') {
      if (!isEnum(searchJointModes, value)) {
        throw new TypeError(
          `Search joint mode \`${value}\` is not valid, expect one of ${searchJointModes.join(
            ', '
          )},`
        );
      }
      joint = value;
      continue;
    }

    if (key.startsWith('mode')) {
      const column = getSearchColumn(key, allowedKeys);

      if (!isEnum(searchMatchModes, value)) {
        throw new TypeError(
          `Search match mode \`${value}\`${conditionalString(
            column && ` for column \`${column}\``
          )} is not valid, expect one of ${searchMatchModes.join(', ')},`
        );
      }
      matchMode.set(column, value);
      continue;
    }

    if (key.startsWith('search')) {
      const column = getSearchColumn(key, allowedKeys);
      const values = matchValues.get(column) ?? [];

      values.push(value);
      matchValues.set(column, values);
      continue;
    }
  }

  return { joint, matchMode, matchValues };
};

/* eslint-disable unicorn/prevent-abbreviations */
export const parseSearchParamsForSearch = <Keys extends string[] = string[]>(
  searchParams: URLSearchParams,
  allowedKeys?: Keys
): Search => {
  /* eslint-enable unicorn/prevent-abbreviations */
  type Key = Keys[number];
  const { joint, matchMode, matchValues } = getSearchMetadata(searchParams, allowedKeys);

  // Validate and generate result
  const matches: SearchItem[] = [];
  const result: Search = {
    matches,
    joint,
  };

  const getModeFor = (key: Optional<Key>): SearchMatchMode =>
    // eslint-disable-next-line unicorn/no-useless-undefined
    matchMode.get(key) ?? matchMode.get(undefined) ?? SearchMatchMode.Like;

  for (const [key, values] of matchValues.entries()) {
    const mode = getModeFor(key);

    if (mode === SearchMatchMode.Exact) {
      if (!values.every(Boolean)) {
        throw new TypeError('Search value cannot be empty.');
      }

      matches.push({ mode, key, value: values });
    } else {
      if (values.length !== 1) {
        throw new TypeError('Only one search value is allowed when search mode is not `exact`.');
      }

      if (!values[0]) {
        throw new TypeError('Search value cannot be empty.');
      }

      matches.push({ mode, key, value: values[0] });
    }
  }

  return result;
};
/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-let, @silverhand/fp/no-mutating-methods */
