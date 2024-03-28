import { describe, it, expect } from 'vitest';

import { findDuplicatedOrBlockedEmailDomains } from './domain.js';

describe('findDuplicatedOrBlockedEmailDomains', () => {
  it('should return blocked domains and duplicated domains correctly', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains([
      'gmail.com',
      'silverhand.io',
      'logto.io',
      'yahoo.com',
      'outlook.com',
      'logto.io',
    ]);
    expect(duplicatedDomains).toEqual(new Set(['logto.io']));
    expect(forbiddenDomains).toEqual(new Set(['gmail.com', 'yahoo.com', 'outlook.com']));
  });

  it('should return empty `duplicatedDomains` and `forbiddenDomains` sets if all domains are valid', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains([
      'silverhand.io',
      'logto.io',
      'metalhand.io',
    ]);
    expect(duplicatedDomains).toEqual(new Set());
    expect(forbiddenDomains).toEqual(new Set());
  });

  it('should return empty `duplicatedDomains` and `forbiddenDomains` sets if input is undefined', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains();
    expect(duplicatedDomains).toEqual(new Set());
    expect(forbiddenDomains).toEqual(new Set());
  });

  it('should return empty `duplicatedDomains` and `forbiddenDomains` sets if input is empty array', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains([]);
    expect(duplicatedDomains).toEqual(new Set());
    expect(forbiddenDomains).toEqual(new Set());
  });
});
