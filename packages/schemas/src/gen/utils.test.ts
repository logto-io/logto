import { getStringMaxLength, splitAtCommasOutsideParentheses } from './utils';

test('splitAtCommasOutsideParentheses should split at each comma that is not in the parentheses', () => {
  const segments = ['a', 'b(1)', 'c(2,3)', 'd(4,(5,6))'];
  expect(splitAtCommasOutsideParentheses(segments.join(','))).toEqual(segments);
});

describe('getStringMaxLength', () => {
  const length = 128;

  test.each([`bpchar(${length})`, `char(${length})`, `varchar(${length})`])(
    'should return the max length of %s',
    (type) => {
      expect(getStringMaxLength(type)).toEqual(length);
    }
  );

  test.each(['text', 'time(6)', 'numeric(4,2)'])(
    'should return undefined since %s is not the character type with length limit',
    (type) => {
      expect(getStringMaxLength(type)).toBeUndefined();
    }
  );
});
