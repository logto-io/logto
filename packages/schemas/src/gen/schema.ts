// LOG-88: Refactor '@logto/schemas' type gen

import { conditionalString } from '@silverhand/essentials';
import camelcase from 'camelcase';
import pluralize from 'pluralize';

import type { TableWithType } from './types.js';

export const generateSchema = ({ name, fields }: TableWithType) => {
  const modelName = pluralize(camelcase(name, { pascalCase: true }), 1);
  const databaseEntryType = `Create${modelName}`;

  return [
    `export type ${databaseEntryType} = {`,
    ...fields.map(
      ({ name, type, isArray, nullable, hasDefaultValue }) =>
        `  ${camelcase(name)}${conditionalString(
          (nullable || hasDefaultValue) && '?'
        )}: ${type}${conditionalString(isArray && '[]')}${conditionalString(
          nullable && !hasDefaultValue && ' | null'
        )};`
    ),
    '};',
    '',
    `export type ${modelName} = {`,
    ...fields.map(
      ({ name, type, isArray, nullable, hasDefaultValue }) =>
        `  ${camelcase(name)}: ${type}${conditionalString(isArray && '[]')}${
          nullable && !hasDefaultValue ? ' | null' : ''
        };`
    ),
    '};',
    '',
    `const createGuard: CreateGuard<${databaseEntryType}> = z.object({`,

    ...fields.map(
      // eslint-disable-next-line complexity
      ({ name, type, isArray, isEnum, nullable, hasDefaultValue, tsType, isString, maxLength }) => {
        if (tsType) {
          return `  ${camelcase(name)}: ${camelcase(tsType)}Guard${conditionalString(
            nullable && '.nullable()'
          )}${conditionalString((nullable || hasDefaultValue) && '.optional()')},`;
        }

        return `  ${camelcase(name)}: z.${
          isEnum ? `nativeEnum(${type})` : `${type}()`
        }${conditionalString(isString && maxLength && `.max(${maxLength})`)}${conditionalString(
          isArray && '.array()'
        )}${conditionalString(nullable && '.nullable()')}${conditionalString(
          (nullable || hasDefaultValue) && '.optional()'
        )},`;
      }
    ),
    '});',
    '',
    `const guard: Guard<${modelName}> = z.object({`,

    ...fields.map(
      // eslint-disable-next-line complexity
      ({ name, type, isArray, isEnum, nullable, tsType, isString, maxLength }) => {
        if (tsType) {
          return `  ${camelcase(name)}: ${camelcase(tsType)}Guard${conditionalString(
            nullable && '.nullable()'
          )},`;
        }

        return `  ${camelcase(name)}: z.${
          isEnum ? `nativeEnum(${type})` : `${type}()`
        }${conditionalString(isString && maxLength && `.max(${maxLength})`)}${conditionalString(
          isArray && '.array()'
        )}${conditionalString(nullable && '.nullable()')},`;
      }
    ),
    '  });',
    '',
    `export const ${camelcase(name, {
      pascalCase: true,
    })}: GeneratedSchema<${databaseEntryType}> = Object.freeze({`,
    `  table: '${name}',`,
    `  tableSingular: '${pluralize(name, 1)}',`,
    '  fields: {',
    ...fields.map(({ name }) => `    ${camelcase(name)}: '${name}',`),
    '  },',
    '  fieldKeys: [',
    ...fields.map(({ name }) => `    '${camelcase(name)}',`),
    '  ] as const,',
    '  createGuard,',
    '  guard,',
    '});',
  ].join('\n');
};
