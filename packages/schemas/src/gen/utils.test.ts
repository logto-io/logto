import { describe, it, expect } from 'vitest';

import { parseType, getType, splitTableFieldDefinitions } from './utils.js';

describe('splitTableFieldDefinitions', () => {
  it('splitTableFieldDefinitions should split at each comma that is not in the parentheses', () => {
    const segments = ['a', 'b(1)', 'c(2,3)', 'd(4,(5,6))'];
    expect(splitTableFieldDefinitions(segments.join(','))).toEqual(segments);
    const oneSegment = 'id bigint';
    expect(splitTableFieldDefinitions(oneSegment)).toEqual([oneSegment]);
  });
});

describe('getType', () => {
  it.each(['varchar(32)[]', 'char', 'text'])('getStringType', (type) => {
    expect(getType(type)).toBe('string');
  });

  it.each(['int2', 'float4', 'timestamp'])('should return number', (type) => {
    expect(getType(type)).toBe('number');
  });
});

describe('parseType', () => {
  const length = 128;

  it('should throw without column name', () => {
    expect(() => parseType('varchar')).toThrow();
  });

  it.each([`foo bpchar(${length})`, `foo char(${length})`, `foo varchar(${length})`])(
    'should return the string max length of %s',
    (type) => {
      expect(parseType(type)).toMatchObject({
        name: 'foo',
        type: 'string',
        isArray: false,
        isString: true,
        maxLength: length,
        hasDefaultValue: false,
        nullable: true,
        tsType: undefined,
        customType: undefined,
      });
    }
  );

  it.each([
    ['foo text', 'string'],
    ['foo timestamp(6)', 'number'],
    ['foo numeric(4,2)', 'number'],
    ['foo jsonb', 'Record<string, unknown>'],
  ])(
    'should not return the max length since %s is not the character type with length limit',
    (value, type) => {
      expect(parseType(value)).toMatchObject({
        name: 'foo',
        type,
        isArray: false,
        maxLength: undefined,
        hasDefaultValue: false,
        nullable: true,
        tsType: undefined,
        customType: undefined,
      });
    }
  );

  it('should return isArray', () => {
    expect(parseType(`foo varchar(${length})[]`)).toMatchObject({
      name: 'foo',
      type: 'string',
      maxLength: length,
      isArray: true,
    });

    expect(parseType(`foo varchar(${length}) array`)).toMatchObject({
      name: 'foo',
      type: 'string',
      maxLength: length,
      isArray: true,
    });
  });

  it('should return tsType', () => {
    expect(
      parseType(
        `custom_client_metadata jsonb /* @use CustomClientMetadata */ not null default '{}'::jsonb,`
      )
    ).toMatchObject({
      name: 'custom_client_metadata',
      type: 'Record<string, unknown>',
      tsType: 'CustomClientMetadata',
      nullable: false,
      hasDefaultValue: true,
    });
  });
});
