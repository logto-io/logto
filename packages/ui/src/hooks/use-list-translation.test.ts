import useListTranslation from './use-list-translation';

const mockT = jest.fn((key: string) => key);

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: (function_: () => void) => function_,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe('useListTranslation (en)', () => {
  const translateList = useListTranslation();

  beforeAll(() => {
    mockT.mockImplementation((key: string) => {
      switch (key) {
        case 'list.or': {
          return 'or';
        }
        case 'list.and': {
          return 'and';
        }
        case 'list.separator': {
          return ',';
        }
        default: {
          return key;
        }
      }
    });
  });

  it('returns undefined for an empty list', () => {
    expect(translateList([])).toBeUndefined();
  });

  it('returns the first item for a list of one item', () => {
    expect(translateList(['a'])).toBe('a');
  });

  it('returns the list with "or" for a list of two items', () => {
    expect(translateList(['a', 'b'])).toBe('a or b');
  });

  it('returns the list with the Oxford comma for a list of three items', () => {
    expect(translateList(['a', 'b', 'c'])).toBe('a, b, or c');
  });

  it('returns the list with the specified joint', () => {
    expect(translateList(['a', 'b', 'c'], 'and')).toBe('a, b, and c');
  });
});

describe('useListTranslation (zh)', () => {
  const translateList = useListTranslation();

  beforeAll(() => {
    mockT.mockImplementation((key: string) => {
      switch (key) {
        case 'list.or': {
          return '或';
        }
        case 'list.and': {
          return '和';
        }
        case 'list.separator': {
          return '、';
        }
        default: {
          return key;
        }
      }
    });
  });

  it('returns undefined for an empty list', () => {
    expect(translateList([])).toBeUndefined();
  });

  it('returns the first item for a list of one item', () => {
    expect(translateList(['苹果'])).toBe('苹果');
  });

  it('returns the list with "或" for a list of two items', () => {
    expect(translateList(['苹果', '橘子'])).toBe('苹果或橘子');
  });

  it('returns the list with the AP style for a list of three items', () => {
    expect(translateList(['苹果', '橘子', '香蕉'])).toBe('苹果、橘子或香蕉');
  });

  it('returns the list with the specified joint', () => {
    expect(translateList(['苹果', '橘子', '香蕉'], 'and')).toBe('苹果、橘子和香蕉');
  });

  it('adds a space between CJK and non-CJK characters', () => {
    expect(translateList(['苹果', '橘子', 'banana'])).toBe('苹果、橘子或 banana');
    expect(translateList(['苹果', '橘子', 'banana'], 'and')).toBe('苹果、橘子和 banana');
    expect(translateList(['banana', '苹果', '橘子'])).toBe('banana、苹果或橘子');
    expect(translateList(['苹果', 'banana', '橘子'])).toBe('苹果、banana 或橘子');
    expect(translateList(['苹果', 'banana', 'orange'])).toBe('苹果、banana 或 orange');
  });
});
