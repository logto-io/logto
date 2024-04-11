import { describe, expect, it } from 'vitest';

import { generateStandardId, generateStandardSecret, generateStandardShortId } from './id.js';

describe('standard id generator', () => {
  it('should match the input length', () => {
    const id = generateStandardId();
    expect(id.length).toEqual(21);
  });
});

describe('standard short id generator', () => {
  it('should match the input length', () => {
    const id = generateStandardShortId();
    expect(id.length).toEqual(12);
  });
});

describe('standard secret generator', () => {
  it('should match the input length', () => {
    const id = generateStandardSecret();
    expect(id.length).toEqual(32);
  });

  it('should generate id with uppercase', () => {
    // If it can't generate uppercase, it will timeout
    while (!/[A-Z]/.test(generateStandardSecret())) {
      // Do nothing
    }
  });
});
