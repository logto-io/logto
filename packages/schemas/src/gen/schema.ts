import { conditionalString } from '@logto/essentials';
import camelcase from 'camelcase';
import pluralize from 'pluralize';

import { TableWithType } from './types';

export const generateSchema = ({ name, fields }: TableWithType) => {
  const databaseEntryType = `${pluralize(camelcase(name, { pascalCase: true }), 1)}DBEntry`;
  return [
    `export type ${databaseEntryType} = {`,
    ...fields.map(
      ({ name, type, isArray, required }) =>
        `  ${camelcase(name)}${conditionalString(!required && '?')}: ${type}${conditionalString(
          isArray && '[]'
        )};`
    ),
    '};',
    '',
    `const guard: Guard<${databaseEntryType}> = z.object({`,
    ...fields.map(({ name, type, isArray, isEnum, required, tsType }) => {
      if (tsType) {
        return `  ${camelcase(name)}: ${camelcase(tsType)}Guard${conditionalString(
          !required && '.optional()'
        )},`;
      }

      return `  ${camelcase(name)}: z.${
        isEnum ? `nativeEnum(${type})` : `${type}()`
      }${conditionalString(isArray && '.array()')}${conditionalString(
        !required && '.optional()'
      )},`;
    }),
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
    '  ],',
    '  guard,',
    '});',
  ].join('\n');
};
