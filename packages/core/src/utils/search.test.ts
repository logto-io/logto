import { SearchJointMode, SearchMatchMode } from '@logto/schemas';

// Will add `params` to the exception list
// eslint-disable-next-line unicorn/prevent-abbreviations
import { parseSearchParamsForSearch } from './search.js';

describe('parseSearchParamsForSearch()', () => {
  it('should throw when input is not valid', () => {
    expect(() => parseSearchParamsForSearch(new URLSearchParams([['joint', 'foo']]))).toThrowError(
      TypeError
    );
    expect(() => parseSearchParamsForSearch(new URLSearchParams([['mode', 'foo']]))).toThrowError(
      TypeError
    );
    expect(() =>
      parseSearchParamsForSearch(new URLSearchParams([['mode.foo', 'foo']]))
    ).toThrowError(TypeError);
    expect(() =>
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'like'],
          ['search', 'foo'],
          ['search', 'bar'],
        ])
      )
    ).toThrowError(/Only one search value/);
    expect(() =>
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'like'],
          ['search', ''],
        ])
      )
    ).toThrowError(/cannot be empty/);
    expect(() =>
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'exact'],
          ['search', ''],
          ['search', 'bar'],
        ])
      )
    ).toThrowError(/cannot be empty/);
    expect(() =>
      parseSearchParamsForSearch(new URLSearchParams([['search.foo.bar', 'baz']]))
    ).toThrowError(/nested search keys/);
    expect(() =>
      parseSearchParamsForSearch(new URLSearchParams([['search.foo', 'baz']]), ['bar'])
    ).toThrowError(/is not allowed/);
  });

  it('should return proper result', () => {
    expect(
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['mode', 'exact'],
          ['search', 'foo'],
          ['search.foo', 'bar%'],
          ['search.bar', 'baz'],
          ['mode.foo', 'like'],
        ])
      )
    ).toStrictEqual({
      matches: [
        { mode: SearchMatchMode.Exact, key: undefined, value: ['foo'] },
        { mode: SearchMatchMode.Like, key: 'foo', value: 'bar%' },
        { mode: SearchMatchMode.Exact, key: 'bar', value: ['baz'] },
      ],
      joint: SearchJointMode.Or,
    });

    expect(
      parseSearchParamsForSearch(
        new URLSearchParams([
          ['joint', 'and'],
          ['search', 'foo'],
        ])
      )
    ).toStrictEqual({
      matches: [{ mode: SearchMatchMode.Like, key: undefined, value: 'foo' }],
      joint: SearchJointMode.And,
    });
  });
});
