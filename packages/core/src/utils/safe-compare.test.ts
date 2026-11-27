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

  it('should return false for different characters of the same encoded length', () => {
    // 'é' and 'e' are both one UTF-16 code unit, so this compares equal-length buffers
    expect(safeCompare('é', 'e')).toBe(false);
  });

  it('should keep lone surrogates distinct', () => {
    // UTF-8 would encode both as U+FFFD and report them equal
    expect(safeCompare('\uD800', '\uD801')).toBe(false);
    expect(safeCompare('\uD800', '\uD800')).toBe(true);
  });

  it('should return false when either side is not a string', () => {
    expect(safeCompare(undefined, undefined)).toBe(false);
    expect(safeCompare('token', undefined)).toBe(false);
    expect(safeCompare(undefined, 'token')).toBe(false);
    expect(safeCompare('1', 1)).toBe(false);
  });
});
