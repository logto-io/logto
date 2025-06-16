import type { Optional } from '@silverhand/essentials';
import { conditional, assert } from '@silverhand/essentials';

import type { Field } from './types.js';

export const normalizeWhitespaces = (string: string): string =>
  string.replaceAll(/\s+/g, ' ').trim();

// eslint-disable-next-line unicorn/prevent-abbreviations -- JSDoc is a term
const leadingJsDocRegex = /^\s*\/\*\* *([^*]*?) *\*\//;

// eslint-disable-next-line unicorn/prevent-abbreviations -- JSDoc is a term
export const stripLeadingJsDocComments = (string: string): string =>
  string.replace(leadingJsDocRegex, '').trim();

// eslint-disable-next-line unicorn/prevent-abbreviations -- JSDoc is a term
export const getLeadingJsDocComments = (string: string): Optional<string> =>
  leadingJsDocRegex.exec(string)?.[1];

// Remove all comments not start with @
export const removeUnrecognizedComments = (string: string): string =>
  string.replaceAll(/\/\*(?!\s@)[^*]+\*\//g, '');

const getCountDelta = (value: string): number => {
  if (value === '(') {
    return 1;
  }

  if (value === ')') {
    return -1;
  }

  return 0;
};

export type ParenthesesMatch = { body: string; prefix: string };

export const findFirstParentheses = (value: string): Optional<ParenthesesMatch> => {
  const { matched, count, ...rest } = Object.values(value).reduce<{
    body: string;
    prefix: string;
    count: number;
    matched: boolean;
  }>(
    (previous, current) => {
      const count = previous.count + getCountDelta(current);

      if (count === 0) {
        if (current === ')') {
          return {
            ...previous,
            count,
            matched: true,
          };
        }

        return {
          ...previous,
          count,
          prefix: previous.prefix + current,
        };
      }

      return {
        ...previous,
        count,
        body: previous.body + (count === 1 && current === '(' ? '' : current),
      };
    },
    {
      body: '',
      prefix: '',
      count: 0,
      matched: false,
    }
  );

  return matched ? rest : undefined;
};

export const splitTableFieldDefinitions = (value: string) =>
  // Split at each comma that is not in parentheses
  Object.values(value).reduce<{ result: string[]; count: number }>(
    ({ result, count: previousCount }, current) => {
      const count = previousCount + getCountDelta(current);

      if (
        count === 0 &&
        current === ',' &&
        // Ignore commas in JSDoc comments
        !stripLeadingJsDocComments(result.at(-1) ?? '').includes('/**')
      ) {
        return {
          result: [...result, ''],
          count,
        };
      }

      const rest = result.slice(0, -1);
      const last = result.at(-1) ?? '';

      return {
        result: [...rest, `${last}${current}`],
        count,
      };
    },
    {
      result: [''],
      count: 0,
    }
  ).result;

const getRawType = (value: string): string => {
  const squareBracketIndex = value.indexOf('[');
  const parenthesesIndex = value.indexOf('(');

  if (parenthesesIndex !== -1) {
    return value.slice(0, parenthesesIndex);
  }

  return squareBracketIndex === -1 ? value : value.slice(0, squareBracketIndex);
};

// Reference: https://github.com/SweetIQ/schemats/blob/7c3d3e16b5d507b4d9bd246794e7463b05d20e75/src/schemaPostgres.ts
// eslint-disable-next-line complexity
export const getType = (
  value: string
): 'string' | 'number' | 'boolean' | 'Record<string, unknown>' | undefined => {
  switch (getRawType(value)) {
    case 'bpchar': // https://www.postgresql.org/docs/current/typeconv-query.html
    case 'char':
    case 'varchar':
    case 'text':
    case 'citext':
    case 'uuid':
    case 'bytea':
    case 'inet':
    case 'time':
    case 'timetz':
    case 'interval':
    case 'name': {
      return 'string';
    }

    case 'int2':
    case 'int4':
    case 'int8':
    case 'bigint':
    case 'float4':
    case 'float8':
    case 'numeric':
    case 'money':
    case 'oid':
    case 'date':
    case 'timestamp':
    case 'timestamptz': {
      return 'number';
    }

    case 'boolean': {
      // https://www.postgresql.org/docs/14/datatype-boolean.html
      return 'boolean';
    }

    case 'json':
    case 'jsonb': {
      return 'Record<string, unknown>';
    }
    default:
  }
};

const parseStringMaxLength = (rawType: string) => {
  const squareBracketIndex = rawType.indexOf('[');

  const parenthesesMatch = findFirstParentheses(
    squareBracketIndex === -1 ? rawType : rawType.slice(0, squareBracketIndex)
  );

  return conditional(
    parenthesesMatch &&
      ['bpchar', 'char', 'varchar'].includes(parenthesesMatch.prefix) &&
      Number(parenthesesMatch.body)
  );
};

export const parseType = (tableFieldDefinition: string): Field => {
  const normalized = stripLeadingJsDocComments(tableFieldDefinition);
  const comments = getLeadingJsDocComments(tableFieldDefinition);

  const [nameRaw, typeRaw, ...rest] = normalized.split(' ');

  assert(nameRaw && typeRaw, new Error('Missing field name or type: ' + normalized));

  const name = nameRaw.toLowerCase();
  const type = typeRaw.toLowerCase();

  const restJoined = rest.join(' ');
  const restLowercased = restJoined.toLowerCase();

  const primitiveType = getType(type);

  const isString = primitiveType === 'string';
  // CAUTION: Only works for single dimension arrays
  const isArray = Boolean(/\[.*]/.test(type)) || restLowercased.includes('array');

  const hasDefaultValue = restLowercased.includes('default');
  const nullable = !restLowercased.includes('not null');
  const tsType = /\/\* @use (.*) \*\//.exec(restJoined)?.[1];

  assert(
    !(!primitiveType && tsType),
    new Error(
      `TS type can only be applied on primitive types, found ${tsType ?? 'N/A'} over ${type}`
    )
  );

  return {
    name,
    comments,
    type: primitiveType,
    isString,
    isArray,
    maxLength: conditional(isString && parseStringMaxLength(type)),
    customType: conditional(!primitiveType && type),
    tsType,
    hasDefaultValue,
    nullable,
  };
};

export const parseTableView = (tablePrefix: string): string | undefined => {
  return /\/\* @view (.*) \*\//.exec(tablePrefix)?.[1]?.trim();
};

/**
 * Extracts the view name from a CREATE VIEW SQL statement.
 */
export const extractViewName = (sql: string): string | undefined => {
  const match = /create\s+view\s+(?:if\s+not\s+exists\s+)?(\w+)/i.exec(sql);
  return match?.[1];
};
