import { describe, expect, it } from 'vitest';

import { customUiCspGuard } from './sign-in-experience.js';

describe('customUiCspGuard', () => {
  it.each([
    {},
    { scriptSrc: ['https://example.com'] },
    { connectSrc: ['https://api.example.com'] },
    {
      scriptSrc: ['https://example.com'],
      connectSrc: ['https://api.example.com'],
    },
  ])('accepts %p', (value) => {
    expect(customUiCspGuard.safeParse(value).success).toBe(true);
  });

  it('rejects unsupported directives', () => {
    expect(customUiCspGuard.safeParse({ imgSrc: ['https://example.com'] }).success).toBe(false);
  });
});
