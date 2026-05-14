import { UserScope } from '@logto/core-kit';
import { describe, expect, it } from 'vitest';

import { protectedAppMetadataGuard } from './applications.js';

const protectedAppMetadata = {
  host: 'example.com',
  origin: 'https://example.com',
  sessionDuration: 3600,
  pageRules: [],
};

describe('protectedAppMetadataGuard', () => {
  it('accepts additional scopes with extended ID token claims', () => {
    expect(
      protectedAppMetadataGuard.safeParse({
        ...protectedAppMetadata,
        additionalScopes: [UserScope.CustomData],
      }).success
    ).toBe(true);
  });

  it('rejects additional scopes without extended ID token claims', () => {
    expect(
      protectedAppMetadataGuard.safeParse({
        ...protectedAppMetadata,
        additionalScopes: [UserScope.Sessions],
      }).success
    ).toBe(false);
  });
});
