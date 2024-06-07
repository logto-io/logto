import { version as currentVersion } from '../../../../core/package.json';

import { isGreaterThanCurrentVersion } from './utils';

describe('isGreaterThanCurrentVersion', () => {
  it('should return true if the target version is greater than the current Logto version', () => {
    expect(isGreaterThanCurrentVersion('v10.0')).toBe(true);
    expect(isGreaterThanCurrentVersion('10.0')).toBe(true);
    expect(isGreaterThanCurrentVersion('v1.999.0')).toBe(true);
    expect(isGreaterThanCurrentVersion('1.999.0')).toBe(true);
  });

  it('should return false if the target version is less than the current Logto version', () => {
    expect(isGreaterThanCurrentVersion('v0.1.1')).toBe(false);
    expect(isGreaterThanCurrentVersion('0.1.1')).toBe(false);
    expect(isGreaterThanCurrentVersion('v1.15')).toBe(false);
    expect(isGreaterThanCurrentVersion('1.15')).toBe(false);
  });

  it('should return false if the target version is malformed', () => {
    expect(isGreaterThanCurrentVersion('vv8')).toBe(false);
    expect(isGreaterThanCurrentVersion('foo')).toBe(false);
  });

  it('should return false if the target version is equal to the current Logto version', () => {
    expect(isGreaterThanCurrentVersion(currentVersion)).toBe(false);
  });
});
