/**
 * Checks if the given domain is a subdomain of a domain.
 */
export const isSubdomainOf = (subdomain: string, domain: string): boolean => {
  return subdomain.endsWith(`.${domain}`);
};
