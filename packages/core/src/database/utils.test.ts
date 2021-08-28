import { sql } from 'slonik';
import { SqlToken } from 'slonik/dist/src/tokens.js';
import dayjs from 'dayjs';
import {
  excludeAutoSetFields,
  autoSetFields,
  convertToPrimitiveOrSql,
  convertToIdentifiers,
  convertToTimestamp,
} from './utils';
import { Table } from './types';

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
  });

  it('converts value to sql when key ends with special set and value is number', () => {
    for (const value of timestampKeyEndings) {
      expect(convertToPrimitiveOrSql(`${normalKey}${value}`, 12_341_234)).toEqual({
        sql: 'to_timestamp($1)',
        type: SqlToken,
        values: [12_341.234],
      });
    }
  });

  it('does not transform value to timestamp when value is not number', () => {
    for (const value of timestampKeyEndings) {
      expect(convertToPrimitiveOrSql(`${normalKey}${value}`, '123')).toEqual('123');
    }
  });

  it('throws an error when value is not primitive', () => {
    // @ts-expect-error
    expect(() => convertToPrimitiveOrSql(normalKey, [123, 456])).toThrow(
      'Cannot convert foo with 123,456 to primitive'
    );
  });
});

describe('convertToIdentifiers()', () => {
  const table = 'foo';
  const fields = {
    fooBar: 'foo_bar',
    baz: 'baz',
  };
  const data: Table = { table, fields };

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
    jest.useFakeTimers('modern');
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
    const time = dayjs(123_123_123);

    expect(convertToTimestamp(time)).toEqual({
      sql: 'to_timestamp($1)',
      type: SqlToken,
      values: [time.valueOf() / 1000],
    });
  });
});
