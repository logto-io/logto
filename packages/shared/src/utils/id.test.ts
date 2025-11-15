import { describe, expect, it } from 'vitest';

import {
  generateId,
  generateStandardId,
  generateStandardSecret,
  generateStandardShortId,
  generateUuidV7,
} from './id.js';

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

describe('UUID v7 generator', () => {
  it('should generate a valid UUID v7', () => {
    const uuid = generateUuidV7();
    expect(uuid.length).toEqual(36);
    // UUID v7 format: 8-4-7xxx-xxxx-12 with hyphens (version field is '7')
    expect(uuid).toMatch(/^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
  });

  it('should generate unique UUID v7s', () => {
    const uuid1 = generateUuidV7();
    const uuid2 = generateUuidV7();
    expect(uuid1).not.toEqual(uuid2);
  });

  it('should generate time-ordered UUIDs', () => {
    const uuid1 = generateUuidV7();
    // Small delay to ensure different timestamp
    const start = Date.now();
    while (Date.now() - start < 2) {
      // Wait 2ms
    }
    const uuid2 = generateUuidV7();

    // UUID v7 should be sortable - later UUIDs should be greater
    expect(uuid2 > uuid1).toBe(true);
  });
});

describe('generateId', () => {
  it('should generate UUID v7 when format is uuidv7', () => {
    const id = generateId('uuidv7');
    expect(id.length).toEqual(36);
    // UUID v7 format: 8-4-7xxx-xxxx-12 with hyphens (version field is '7')
    expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
  });

  it('should generate nanoid when format is nanoid with default size', () => {
    const id = generateId('nanoid');
    expect(id.length).toEqual(21);
    // Nanoid uses lowercase alphanumeric characters
    expect(id).toMatch(/^[\da-z]{21}$/);
  });

  it('should generate nanoid with custom size', () => {
    const id = generateId('nanoid', 12);
    expect(id.length).toEqual(12);
    expect(id).toMatch(/^[\da-z]{12}$/);
  });

  it('should generate nanoid with size 21 when size is specified', () => {
    const id = generateId('nanoid', 21);
    expect(id.length).toEqual(21);
    expect(id).toMatch(/^[\da-z]{21}$/);
  });
});
