/**
 * Checks if the subdomain string is valid
 * @param subdomain subdomain string
 * @returns boolean indicating whether the subdomain is valid
 */
export const isValidSubdomain = (subdomain: string): boolean =>
  /^([\da-z]([\da-z-]{0,61}[\da-z])?)$/.test(subdomain);
