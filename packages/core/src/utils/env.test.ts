import { assertEnv, getEnv } from './env';

describe('getEnv()', () => {
  beforeAll(() => {
    process.env = { FOO: 'bar' };
  });

  it('returns correct env value', () => {
    expect(getEnv('FOO')).toEqual('bar');
  });

  it("returns fallback if env doesn't exist", () => {
    expect(getEnv('BAR', '123')).toEqual('123');
  });
});

describe('assertEnv()', () => {
  beforeAll(() => {
    process.env = { FOO: 'bar' };
  });

  it('returns correct env value', () => {
    expect(assertEnv('FOO')).toEqual('bar');
  });

  it("throws an error if env doesn't exist", () => {
    expect(() => assertEnv('BAR')).toThrow('env variable BAR not found');
  });
});
