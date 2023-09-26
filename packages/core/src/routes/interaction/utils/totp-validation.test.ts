const { jest } = import.meta;

const { generateTotpSecret, validateTotpToken } = await import('./totp-validation.js');

describe('generateTotpSecret', () => {
  it('should generate a secret', () => {
    expect(typeof generateTotpSecret()).toBe('string');
  });
});

describe('validateTotpToken', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(1_695_010_563_617));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return true on valid token', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const token = '971144';

    expect(validateTotpToken(secret, token)).toBe(true);
  });

  it('should return false on invalid token', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const token = '123456';

    expect(validateTotpToken(secret, token)).toBe(false);
  });
});
