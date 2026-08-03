import { emailOrEmailDomainRegEx } from './regex.js';

const wildcard = '*';
const emailSeparator = '@';
const domainSeparator = '.';
const gmailDomains = new Set(['gmail.com', 'googlemail.com']);
const whitespaceRegEx = /\s/u;
const wildcardOnlyDomainRegEx = /^[*.]+$/u;

const hasWildcard = (value: string) => value.includes(wildcard);

const escapeRegExp = (value: string) => value.replaceAll(/[.+?^${}()|[\]\\]/gu, '\\$&');

const buildWildcardRegExp = (pattern: string) =>
  new RegExp(`^${escapeRegExp(pattern).replaceAll(wildcard, '.*')}$`, 'u');

const matchesPattern = (pattern: string, value: string) =>
  hasWildcard(pattern) ? buildWildcardRegExp(pattern).test(value) : pattern === value;

const removeDotsFromLocalPart = (value: string) => {
  const separatorIndex = value.indexOf(emailSeparator);

  if (separatorIndex === -1) {
    return value;
  }

  return `${value.slice(0, separatorIndex).replaceAll(domainSeparator, '')}${value.slice(
    separatorIndex
  )}`;
};

const buildGmailAddressVariants = (email: string) => {
  const emailWithoutLocalPartDots = removeDotsFromLocalPart(email);
  const separatorIndex = emailWithoutLocalPartDots.indexOf(emailSeparator);
  const localPart = emailWithoutLocalPartDots.slice(0, separatorIndex);

  return Array.from(gmailDomains, (domain) => `${localPart}${emailSeparator}${domain}`);
};

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
 * domain, while full email items match the complete email address. `gmail.com` and
 * `googlemail.com` are treated as the same domain, and dots in their local parts are
 * ignored because Gmail treats those variants as the same mailbox.
 */
export const matchesEmailBlocklistItem = (item: string, email: string) => {
  const normalizedItem = item.toLowerCase();
  const normalizedEmail = email.toLowerCase();
  const domain = normalizedEmail.split(emailSeparator)[1];

  if (normalizedItem.startsWith(emailSeparator)) {
    if (!domain) {
      return false;
    }

    const comparableDomains = gmailDomains.has(domain) ? gmailDomains : [domain];

    return Array.from(comparableDomains).some((comparableDomain) =>
      matchesPattern(normalizedItem.slice(1), comparableDomain)
    );
  }

  const comparableItem =
    domain && gmailDomains.has(domain) ? removeDotsFromLocalPart(normalizedItem) : normalizedItem;
  const comparableEmails =
    domain && gmailDomains.has(domain)
      ? buildGmailAddressVariants(normalizedEmail)
      : [normalizedEmail];

  return comparableEmails.some((comparableEmail) =>
    matchesPattern(comparableItem, comparableEmail)
  );
};
