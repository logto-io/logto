import { compareVersion, getVersionFromFileName } from './utils';

describe('compareVersion', () => {
  it('should return 1 for 1.0.0 and 1.0.0-beta.9', () => {
    expect(compareVersion('1.0.0', '1.0.0-beta.9')).toBe(1);
  });

  it('should return 1 for 1.0.0-beta.10 and 1.0.0-beta.9', () => {
    expect(compareVersion('1.0.0-beta.10', '1.0.0-beta.9')).toBe(1);
  });

  it('should return 1 for 1.0.0 and 0.0.8', () => {
    expect(compareVersion('1.0.0', '0.0.8')).toBe(1);
  });
});

describe('getVersionFromFileName', () => {
  it('should get version for 1.0.2.js', () => {
    expect(getVersionFromFileName('1.0.2.js')).toEqual('1.0.2');
  });

  it('should throw for next.js', () => {
    expect(() => getVersionFromFileName('next.js')).toThrowError();
  });
});
