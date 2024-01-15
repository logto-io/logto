import { isSubdomainOf } from './domain.js';

describe('isSubdomainOf()', () => {
  it('should return true if the given domain is a subdomain of a domain', () => {
    expect(isSubdomainOf('subdomain.domain.com', 'domain.com')).toBe(true);
  });

  it('should return false if the given domain is not a subdomain of a domain', () => {
    expect(isSubdomainOf('subdomain.domain.com', 'domain.org')).toBe(false);
    expect(isSubdomainOf('subdomaindomain.com', 'domain.org')).toBe(false);
  });
});
