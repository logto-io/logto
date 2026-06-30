const { jest } = import.meta;

const { generateTotpSecret, getTotpTokenTimeStep, validateTotpToken, validateTotpSecret } =
  await import('./totp-validation.js');

describe('generateTotpSecret', () => {
  it('should generate a secret', () => {
    expect(typeof generateTotpSecret()).toBe('string');
  });
});

describe('validateTotpSecret', () => {
  it('should return true on valid secret', () => {
    expect(validateTotpSecret(generateTotpSecret())).toBe(true);
  });

  it('should return false on invalid secret', () => {
    expect(validateTotpSecret('invalid')).toBe(false);
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

describe('getTotpTokenTimeStep', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(1_695_010_563_617));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return the matched TOTP time step', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const token = '971144';

    expect(getTotpTokenTimeStep(secret, token)).toBe(56_500_352);
  });

  it('should return undefined on invalid token', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const token = '123456';

    expect(getTotpTokenTimeStep(secret, token)).toBeUndefined();
  });
});
