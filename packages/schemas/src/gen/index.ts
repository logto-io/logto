import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';

import { findFirstParentheses, getType, normalizeWhitespaces, removeParentheses } from './utils';

type Field = {
  name: string;
  type: string;
  required: boolean;
  isArray: boolean;
};

type Table = {
  name: string;
  fields: Field[];
};

const dir = 'tables';

const generate = async () => {
  const files = await fs.readdir(dir);
  const generated = await Promise.all(
    files.map(async (file) => {
      return (await fs.readFile(path.join(dir, file), { encoding: 'utf-8' }))
        .split(';')
        .map((value) => normalizeWhitespaces(value).toLowerCase())
        .filter((value) => value.startsWith('create table'))
        .map((value) => findFirstParentheses(value))
        .filter((value): value is NonNullable<typeof value> => Boolean(value))
        .map<Table>(({ prefix, body }) => {
          const name = normalizeWhitespaces(prefix).split(' ')[2];
          assert(name, 'Missing table name: ' + prefix);

          const fields = removeParentheses(body)
            .split(',')
            .map((value) => normalizeWhitespaces(value))
            .filter((value) =>
              ['primary', 'foreign', 'unique', 'exclude', 'check'].every(
                (constraint) => !value.startsWith(constraint)
              )
            )
            .map<Field>((value) => {
              const [name, type, ...rest] = value.split(' ');
              assert(name && type, 'Missing column name or type: ' + value);

              const restJoined = rest.join(' ');
              // CAUTION: Only works for single dimension arrays
              const isArray = Boolean(/\[.*]/.test(type)) || restJoined.includes('array');
              const required = restJoined.includes('not null');

              return {
                name,
                type: getType(type),
                isArray,
                required,
              };
            });
          return { name, fields };
        });
    })
  );
  const tables = generated.flat();
  console.log(tables);
};

void generate();
