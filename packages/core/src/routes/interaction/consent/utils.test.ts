import { buildResourceScopesToReject } from './utils.js';

describe('buildResourceScopesToReject', () => {
  it('should reject the remainder of a partially granted group', () => {
    expect(
      buildResourceScopesToReject(
        { 'https://api.example.com': ['read', 'write'] },
        { 'https://api.example.com': ['read'] },
        false
      )
    ).toEqual({ 'https://api.example.com': ['write'] });
  });

  it('should reject the whole group for a CIMD consent submitted without an organization', () => {
    // The group's scopes are reachable through organization roles only, so the rebuild grants nothing for it.
    expect(
      buildResourceScopesToReject({ 'https://api.example.com': ['read', 'write'] }, {}, true)
    ).toEqual({ 'https://api.example.com': ['read', 'write'] });
  });

  it('should reject the whole group for a CIMD consent when the selected organization contributes none of the requested scopes', () => {
    expect(
      buildResourceScopesToReject(
        { 'https://api.example.com': ['read'] },
        { 'urn:logto:resource:organizations': ['org:read'] },
        true
      )
    ).toEqual({ 'https://api.example.com': ['read'] });
  });

  it('should leave an ungrantable group unencountered for a registered client', () => {
    expect(buildResourceScopesToReject({ 'https://api.example.com': ['read'] }, {}, false)).toEqual(
      {
        'https://api.example.com': [],
      }
    );
  });
});
