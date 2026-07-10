import { emailOrEmailDomainRegEx } from './regex.js';

const wildcard = '*';
const emailSeparator = '@';
const domainSeparator = '.';
const whitespaceRegEx = /\s/u;
const wildcardOnlyDomainRegEx = /^[*.]+$/u;

const hasWildcard = (value: string) => value.includes(wildcard);

const escapeRegExp = (value: string) => value.replaceAll(/[.+?^${}()|[\]\\]/gu, '\\$&');

const buildWildcardRegExp = (pattern: string) =>
  new RegExp(`^${escapeRegExp(pattern).replaceAll(wildcard, '.*')}$`, 'u');

const isValidWildcardLocalPart = (localPart: string) =>
  localPart.length > 0 && !localPart.includes(emailSeparator) && !whitespaceRegEx.test(localPart);

const isValidWildcardDomain = (domain: string) =>
  domain.length > 0 &&
  domain.includes(domainSeparator) &&
  !domain.includes(emailSeparator) &&
  !domain.includes(`${domainSeparator}${domainSeparator}`) &&
  !domain.startsWith(domainSeparator) &&
  !domain.endsWith(domainSeparator) &&
  !whitespaceRegEx.test(domain) &&
  !wildcardOnlyDomainRegEx.test(domain);

/**
 * Validates an email blocklist item.
 *
 * An item can be either a full email address (`foo@example.com`) or a domain entry
 * prefixed with `@` (`@example.com`). `*` can be used inside the local part or
 * domain while keeping the same email/domain shapes.
 */
export const isEmailBlocklistItem = (value: string) => {
  if (!hasWildcard(value)) {
    return emailOrEmailDomainRegEx.test(value);
  }

  if (whitespaceRegEx.test(value)) {
    return false;
  }

  if (value.startsWith(emailSeparator)) {
    return isValidWildcardDomain(value.slice(1));
  }

  const emailParts = value.split(emailSeparator);

  if (emailParts.length !== 2) {
    return false;
  }

  const [localPart, domain] = emailParts;

  return (
    localPart !== undefined &&
    domain !== undefined &&
    isValidWildcardLocalPart(localPart) &&
    isValidWildcardDomain(domain)
  );
};

/**
 * Checks whether an email address matches an email blocklist item.
 *
 * Matching is case-insensitive. Domain items (`@example.com`) match only the email
 * domain, while full email items match the complete email address.
 */
export const matchesEmailBlocklistItem = (item: string, email: string) => {
  const normalizedItem = item.toLowerCase();
  const normalizedEmail = email.toLowerCase();
  const domain = normalizedEmail.split(emailSeparator)[1];

  if (normalizedItem.startsWith(emailSeparator)) {
    return Boolean(
      domain &&
        (hasWildcard(normalizedItem.slice(1))
          ? buildWildcardRegExp(normalizedItem.slice(1)).test(domain)
          : domain === normalizedItem.slice(1))
    );
  }

  return hasWildcard(normalizedItem)
    ? buildWildcardRegExp(normalizedItem).test(normalizedEmail)
    : normalizedEmail === normalizedItem;
};
