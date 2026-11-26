import { safeCompare } from './safe-compare.js';

describe('safeCompare()', () => {
  it('should return true for identical strings', () => {
    expect(safeCompare('token', 'token')).toBe(true);
  });

  it('should return false for strings of the same length that differ', () => {
    expect(safeCompare('token-a', 'token-b')).toBe(false);
  });

  it('should return false (and not throw) for strings of different length', () => {
    expect(safeCompare('token', 'token-longer')).toBe(false);
    expect(safeCompare('token-longer', 'token')).toBe(false);
    expect(safeCompare('', 'token')).toBe(false);
  });

  it('should compare by byte length, not character count', () => {
    // 'é' is 2 bytes in UTF-8, so these have the same char count but different byte length
    expect(safeCompare('é', 'e')).toBe(false);
  });

  it('should return false when either side is not a string', () => {
    expect(safeCompare(undefined, undefined)).toBe(false);
    expect(safeCompare('token', undefined)).toBe(false);
    expect(safeCompare(undefined, 'token')).toBe(false);
    expect(safeCompare('1', 1)).toBe(false);
  });
});
