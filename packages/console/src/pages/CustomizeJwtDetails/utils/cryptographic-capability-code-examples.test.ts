import {
  accessTokenCryptographicCapabilityCodeExample,
  clientCredentialsCryptographicCapabilityCodeExample,
} from './cryptographic-capability-code-examples';

describe('Custom JWT cryptographic capability examples', () => {
  it('uses the user ID for access tokens', () => {
    expect(accessTokenCryptographicCapabilityCodeExample).toContain(
      'const userId = context.user.id;'
    );
    expect(accessTokenCryptographicCapabilityCodeExample).toContain('return { stableId };');
  });

  it('pseudonymizes an optional application owner ID for client credentials', () => {
    expect(clientCredentialsCryptographicCapabilityCodeExample).toContain(
      'const ownerId = context.application?.customData.ownerId;'
    );
    expect(clientCredentialsCryptographicCapabilityCodeExample).toContain(
      "if (typeof ownerId !== 'string' || !ownerId) {\n    return {};"
    );
    expect(clientCredentialsCryptographicCapabilityCodeExample).toContain(
      'return { stableOwnerId };'
    );
  });
});
