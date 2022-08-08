import { parseType, splitColumnDefinitions } from './utils';

test('splitColumnDefinitions should split at each comma that is not in the parentheses', () => {
  const segments = ['a', 'b(1)', 'c(2,3)', 'd(4,(5,6))'];
  expect(splitColumnDefinitions(segments.join(','))).toEqual(segments);
});

describe('parseType', () => {
  const length = 128;

  test.each([`bpchar(${length})`, `char(${length})`, `varchar(${length})`])(
    'should return the string max length of %s',
    (type) => {
      expect(parseType(type)).toEqual({
        type: 'string',
        isString: true,
        maxLength: length,
      });
    }
  );

  test.each([
    ['text', 'string', true],
    ['timestamp(6)', 'number', false],
    ['numeric(4,2)', 'number', false],
    ['jsonb', 'Record<string, unknown>', false],
  ])(
    'should not return the max length since %s is not the character type with length limit',
    (value, type, isString) => {
      expect(parseType(value)).toEqual({
        type,
        isString,
      });
    }
  );
});
