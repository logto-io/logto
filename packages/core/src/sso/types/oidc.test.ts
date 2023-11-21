import { scopePostProcessor, RequiredOidcScope } from './oidc.js';

describe('scopePostProcessor', () => {
  const defaultScopes = Object.values(RequiredOidcScope);

  it('`RequiredOidcScopes` will be added if not exists (with empty string)', () => {
    for (const scope of defaultScopes) {
      expect(scopePostProcessor('')).toContain(scope);
    }
  });

  it('`RequiredOidcScopes` will be added if not exists (with non-empty string)', () => {
    const scopes = scopePostProcessor('read');
    for (const scope of defaultScopes) {
      expect(scopePostProcessor('read')).toContain(scope);
    }
    expect(scopes).toContain('read');
  });
});
