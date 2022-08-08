import { conditional, conditionalString, Optional } from '@silverhand/essentials';

export const normalizeWhitespaces = (string: string): string => string.replace(/\s+/g, ' ').trim();

// Remove all comments not start with @
export const removeUnrecognizedComments = (string: string): string =>
  string.replace(/\/\*(?!\s@)[^*]+\*\//g, '');

const getCountDelta = (value: string): number => {
  if (value === '(') {
    return 1;
  }

  if (value === ')') {
    return -1;
  }

  return 0;
};

export const removeParentheses = (value: string) =>
  Object.values(value).reduce<{ result: string; count: number }>(
    (previous, current) => {
      const count = previous.count + getCountDelta(current);

      return count === 0 && current !== ')'
        ? { result: previous.result + current, count }
        : { result: previous.result, count };
    },
    {
      result: '',
      count: 0,
    }
  ).result;

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

export const splitColumnDefinitions = (value: string) =>
  // Split at each comma that is not in parentheses
  Object.values(value).reduce<{ result: string[]; count: number }>(
    ({ result, count: previousCount }, current) => {
      const count = previousCount + getCountDelta(current);

      if (count === 0 && current === ',') {
        return {
          result: [...result, ''],
          count,
        };
      }

      return {
        result: [
          ...result.slice(0, -1),
          `${conditionalString(result[result.length - 1])}${current}`,
        ],
        count,
      };
    },
    {
      result: [''],
      count: 0,
    }
  ).result;

const getRawType = (value: string): string => {
  const bracketIndex = value.indexOf('[');

  return bracketIndex === -1 ? value : value.slice(0, bracketIndex);
};

// Reference: https://github.com/SweetIQ/schemats/blob/7c3d3e16b5d507b4d9bd246794e7463b05d20e75/src/schemaPostgres.ts
// eslint-disable-next-line complexity
const getType = (
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
    case 'name':
      return 'string';
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
    case 'timestamptz':
      return 'number';
    case 'boolean': // https://www.postgresql.org/docs/14/datatype-boolean.html
      return 'boolean';
    case 'json':
    case 'jsonb':
      return 'Record<string, unknown>';
    default:
  }
};

export const parseType = (value: string) => {
  const typeName = removeParentheses(value);
  const type = getType(typeName);

  const isString = type === 'string';
  const parenthesesMatch = findFirstParentheses(value);
  const maxLength = conditional(
    isString &&
      parenthesesMatch &&
      ['bpchar', 'char', 'varchar'].includes(parenthesesMatch.prefix) &&
      Number(parenthesesMatch.body)
  );

  return {
    type,
    isString,
    maxLength,
  };
};
