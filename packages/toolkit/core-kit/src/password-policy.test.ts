import { ZodError } from 'zod';

import { PasswordPolicyChecker } from './password-policy.js';

const { jest } = import.meta;

const mockPwnResponse = () => {
  const originalFetch = global.fetch;
  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    global.fetch = jest.fn().mockResolvedValue({
      // Return hash suffixes for '123456'.
      text: async () =>
        'D032E84B0AEB4E773555C73D6B13BEA7A44:1\nD09CA3762AF61E59520943DC26494F8941B:37615252',
    });
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    global.fetch = originalFetch;
  });
};

describe('PasswordPolicyChecker', () => {
  it('should reject malformed policy', () => {
    expect(() => {
      // @ts-expect-error
      return new PasswordPolicyChecker({ length: { min: 1, max: '2' } });
    }).toThrowError(ZodError);
  });
});

describe('PasswordPolicyChecker -> check()', () => {
  mockPwnResponse();

  const checker = new PasswordPolicyChecker({
    length: { min: 7, max: 8 },
    characterTypes: { min: 2 },
    rejects: {
      pwned: true,
      repetitionAndSequence: true,
      personalInfo: true,
      words: ['test', 'aaaa'],
    },
  });

  it('should accept valid password', async () => {
    expect(await checker.check('aL1!aL1!', {})).toEqual([]);
  });

  it('should reject with all failed checks', async () => {
    expect(await checker.check('aaa', {})).toEqual([
      { code: 'password_rejected.too_short', interpolation: { min: 7 } },
      { code: 'password_rejected.character_types', interpolation: { min: 2 } },
      { code: 'password_rejected.repetition' },
    ]);

    expect(await checker.check('123456', { phoneNumber: '12345' })).toEqual([
      { code: 'password_rejected.too_short', interpolation: { min: 7 } },
      { code: 'password_rejected.character_types', interpolation: { min: 2 } },
      { code: 'password_rejected.sequence' },
      { code: 'password_rejected.pwned' },
      { code: 'password_rejected.personal_info' },
    ]);

    expect(await checker.check('aaaaaatest😀', {})).toEqual([
      { code: 'password_rejected.too_long', interpolation: { max: 8 } },
      { code: 'password_rejected.unsupported_characters' },
      { code: 'password_rejected.repetition' },
      {
        code: 'password_rejected.restricted_words',
        interpolation: { words: 'test\naaaa', count: 2 },
      },
    ]);
  });
});

describe('PasswordPolicyChecker -> checkCharTypes()', () => {
  const checker1 = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: false, repetitionAndSequence: false, personalInfo: false, words: [] },
  });
  const checker2 = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 4 },
    rejects: { pwned: false, repetitionAndSequence: false, personalInfo: false, words: [] },
  });

  it('should reject unsupported characters', () => {
    expect(checker1.checkCharTypes('😀')).toBe('unsupported');
    expect(checker2.checkCharTypes('aA1!😀')).toBe('unsupported');
  });

  it('should reject password with too few character types', () => {
    expect(checker1.checkCharTypes('a')).toBe(false);
    expect(checker2.checkCharTypes('aA')).toBe(false);
  });

  it('should accept password with enough character types', () => {
    expect(checker1.checkCharTypes('aA')).toBe(true);
    expect(checker1.checkCharTypes('aA1!0')).toBe(true);
    expect(checker2.checkCharTypes('aA1!0')).toBe(true);
  });
});

describe('PasswordPolicyChecker -> hasBeenPwned()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: true, repetitionAndSequence: false, personalInfo: false, words: [] },
  });

  mockPwnResponse();

  it('should reject pwned password', async () => {
    expect(await checker.hasBeenPwned('123456')).toBe(true);
  });

  it('should accept non-pwned password', async () => {
    expect(await checker.hasBeenPwned('1')).toBe(false);
  });
});

describe('PasswordPolicyChecker -> hasRepetition()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: false, repetitionAndSequence: true, words: [] },
  });

  it('should reject password with too many repeated characters', () => {
    expect(checker.hasRepetition('aaaa')).toBe(true);
    expect(checker.hasRepetition('aL1!bbbbb')).toBe(true);
    expect(checker.hasRepetition('aaaaaatest😀')).toBe(true);
  });

  it('should accept password with few repeated characters', () => {
    expect(checker.hasRepetition('aL1!')).toBe(false);
    expect(checker.hasRepetition('aL1!bbbb')).toBe(false);
  });
});

describe('PasswordPolicyChecker -> hasPersonalInfo()', () => {
  const checker = new PasswordPolicyChecker({
    rejects: { pwned: false, repetitionAndSequence: false, personalInfo: true, words: [] },
  });

  it('should reject password with name', () => {
    expect(checker.hasPersonalInfo('test', { name: 'test' })).toBe(true);
    expect(checker.hasPersonalInfo('test', { name: 'test2' })).toBe(false);
    expect(checker.hasPersonalInfo('FOO', { name: 'Foo bar' })).toBe(true);
    expect(checker.hasPersonalInfo('Foo', { name: 'bar fOo' })).toBe(true);
  });

  it('should reject password with username', () => {
    expect(checker.hasPersonalInfo('123.456!test', { username: 'teST' })).toBe(true);
    expect(checker.hasPersonalInfo('test', { username: 'test2' })).toBe(false);
  });

  it('should reject password with email', () => {
    expect(checker.hasPersonalInfo('teST', { email: 'test@foo.com' })).toBe(true);
    expect(checker.hasPersonalInfo('TEST', { email: 'test1@foo.com' })).toBe(false);
    expect(checker.hasPersonalInfo('FOO', { email: 'test@foo.com' })).toBe(false);
    expect(checker.hasPersonalInfo('Foo', { email: 'fOO@foo.com' })).toBe(true);
  });

  it('should reject password with phone number', () => {
    expect(checker.hasPersonalInfo('teST1234567890.', { phoneNumber: '123456789' })).toBe(true);
    expect(checker.hasPersonalInfo('TEST12345678', { phoneNumber: '123456789' })).toBe(false);
  });
});

describe('PasswordPolicyChecker -> hasWords()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: {
      pwned: false,
      repetitionAndSequence: false,
      personalInfo: false,
      words: ['test', 'teSt2', 'TesT3'],
    },
  });

  it('should reject password with blacklisted words (case insensitive)', () => {
    expect(checker.hasWords('test')).toEqual(['test']);
    expect(checker.hasWords('tEst2')).toEqual(['test', 'test2']);
    expect(checker.hasWords('tEST TEst2 teSt3')).toEqual(['test', 'test2', 'test3']);
  });

  it('should accept password without blacklisted words', () => {
    expect(checker.hasWords('tes4')).toEqual([]);
    expect(checker.hasWords('tes4 est5 tes t')).toEqual([]);
  });
});

describe('PasswordPolicyChecker -> hasSequentialChars()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: false, repetitionAndSequence: true, personalInfo: false, words: [] },
  });

  it('should reject password with too many sequential characters', () => {
    expect(checker.hasSequentialChars('FE')).toBe(true);
    expect(checker.hasSequentialChars('1234')).toBe(true);
    expect(checker.hasSequentialChars('edcba')).toBe(true);
    expect(checker.hasSequentialChars('aL1!BCDEFA')).toBe(true);
  });

  it('should accept password with few sequential characters', () => {
    expect(checker.hasSequentialChars('z')).toBe(false);
    expect(checker.hasSequentialChars('aL1!')).toBe(false);
    expect(checker.hasSequentialChars('aL1!bcdedcb1234321')).toBe(false);
  });
});
