import type { Table } from '@logto/shared';
import { sql } from '@silverhand/slonik';
import { SqlToken } from '@silverhand/slonik/dist/src/tokens.js';

import {
  excludeAutoSetFields,
  autoSetFields,
  convertToPrimitiveOrSql,
  convertToIdentifiers,
  convertToTimestamp,
  conditionalSql,
} from './sql.js';

const { jest } = import.meta;

describe('conditionalSql()', () => {
  it('returns empty sql when value is falsy', () => {
    expect(conditionalSql(false, () => sql`select 1`)).toEqual({
      sql: '',
      type: SqlToken,
      values: [],
    });
  });

  it('builds sql when value is truthy', () => {
    expect(conditionalSql(true, () => sql`select 1`)).toEqual({
      sql: 'select 1',
      type: SqlToken,
      values: [],
    });
  });
});

describe('excludeAutoSetFields()', () => {
  it('excludes auto set fields when needed', () => {
    expect(excludeAutoSetFields(['foo', autoSetFields[0]])).toEqual(['foo']);
  });

  it('keeps the original value when no auto-set field is found', () => {
    expect(excludeAutoSetFields(['foo'])).toEqual(['foo']);
  });
});

describe('convertToPrimitiveOrSql()', () => {
  const normalKey = 'foo';
  const timestampKeyEndings = ['_at', 'At'];

  it('does not transform normal values with normal key', () => {
    expect(convertToPrimitiveOrSql(normalKey, null)).toEqual(null);
    expect(convertToPrimitiveOrSql(normalKey, 'bar')).toEqual('bar');
    expect(convertToPrimitiveOrSql(normalKey, 123)).toEqual(123);
    expect(convertToPrimitiveOrSql(normalKey, true)).toEqual(true);
    expect(convertToPrimitiveOrSql(normalKey, { foo: 'bar' })).toEqual('{"foo":"bar"}');
    expect(convertToPrimitiveOrSql(normalKey, ['bar'])).toEqual('["bar"]');
  });

  it('converts empty string to null value', () => {
    expect(convertToPrimitiveOrSql(normalKey, '')).toEqual(null);
  });

  it('converts value to sql when key ends with special set and value is number', () => {
    for (const value of timestampKeyEndings) {
      expect(convertToPrimitiveOrSql(`${normalKey}${value}`, 12_341_234)).toEqual({
        sql: 'to_timestamp($1::double precision / 1000)',
        type: SqlToken,
        values: [12_341_234],
      });
    }
  });

  it('does not transform value to timestamp when value is not number', () => {
    for (const value of timestampKeyEndings) {
      expect(convertToPrimitiveOrSql(`${normalKey}${value}`, '123')).toEqual('123');
    }
  });
});

describe('convertToIdentifiers()', () => {
  const table = 'foo';
  const fields = {
    fooBar: 'foo_bar',
    baz: 'baz',
  };
  const data: Table<string> = { table, fields };

  it('converts table to correct identifiers', () => {
    expect(convertToIdentifiers(data)).toEqual({
      table: sql.identifier([table]),
      fields: {
        fooBar: sql.identifier([fields.fooBar]),
        baz: sql.identifier([fields.baz]),
      },
    });
  });

  it('converts table to correct identifiers with prefix', () => {
    expect(convertToIdentifiers(data, true)).toEqual({
      table: sql.identifier([table]),
      fields: {
        fooBar: sql.identifier([table, fields.fooBar]),
        baz: sql.identifier([table, fields.baz]),
      },
    });
  });
});

describe('convertToTimestamp()', () => {
  const fakeTime = new Date();

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fakeTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('converts to sql with current time by default', () => {
    expect(convertToTimestamp()).toEqual({
      sql: 'to_timestamp($1)',
      type: SqlToken,
      values: [fakeTime.valueOf() / 1000],
    });
  });

  it('converts to sql per time parameter', () => {
    const time = new Date(123_123_123);

    expect(convertToTimestamp(time)).toEqual({
      sql: 'to_timestamp($1)',
      type: SqlToken,
      values: [time.valueOf() / 1000],
    });
  });
});
