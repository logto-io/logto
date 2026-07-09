import { emailOrEmailDomainRegEx } from './regex.js';
import { isWildcardPatternSubset } from './wildcard-pattern.js';

export type EmailBlocklistPolicyShape = Readonly<{
  blockSubaddressing?: boolean;
  customBlocklist?: readonly string[];
}>;

export type BlockedAllowlistItem = Readonly<{
  allowItem: string;
  blockedBy: string | 'blockSubaddressing';
}>;

const wildcard = '*';
const emailSeparator = '@';
const domainSeparator = '.';
const whitespaceRegEx = /\s/u;
const wildcardOnlyDomainRegEx = /^[*.]+$/u;

/**
 * Returns whether an email list item contains wildcard syntax.
 */
const hasWildcard = (value: string) => value.includes(wildcard);

/**
 * Escapes literal characters before a wildcard pattern is converted to a regular expression.
 */
const escapeRegExp = (value: string) => value.replaceAll(/[.+?^${}()|[\]\\]/gu, '\\$&');

/**
 * Builds an anchored regular expression for matching a wildcard email list item.
 *
 * Only `*` is treated as wildcard syntax; all other regular expression meta characters are
 * escaped and matched literally.
 */
const buildWildcardRegExp = (pattern: string) =>
  new RegExp(`^${escapeRegExp(pattern).replaceAll(wildcard, '.*')}$`, 'u');

/**
 * Validates the local-part shape for a wildcard email list item.
 */
const isValidWildcardLocalPart = (localPart: string) =>
  localPart.length > 0 && !localPart.includes(emailSeparator) && !whitespaceRegEx.test(localPart);

/**
 * Validates the domain shape for a wildcard email list item.
 *
 * The domain must keep the same rough email-domain shape as non-wildcard entries, while allowing
 * `*` inside labels. Pure wildcard domains such as `*` or `*.*` are rejected because they are too
 * broad to be meaningful list entries.
 */
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
 * Splits an email list item into local-part and domain pieces.
 *
 * Domain-only items (`@example.com`) return only the domain. Malformed values return `undefined`.
 * Full validation is still handled by `isEmailListItem()` before public coverage checks use these
 * parsed parts.
 */
const getEmailParts = (item: string) => {
  if (item.startsWith(emailSeparator)) {
    const domain = item.slice(1);

    if (!domain || domain.includes(emailSeparator)) {
      return;
    }

    return { domain };
  }

  const [localPart, domain, ...rest] = item.split(emailSeparator);

  if (rest.length > 0 || !localPart || !domain) {
    return;
  }

  return { localPart, domain };
};

/**
 * Returns whether a wildcard pattern consists only of `*` tokens.
 */
const isWildcardOnly = (pattern: string) =>
  [...pattern].every((character) => character === wildcard);

/**
 * Checks whether a local part is fully denied by the block-subaddressing rule.
 *
 * Literal local parts are covered when they contain `+`. Wildcard local parts are covered only when
 * their whole language is a subset of `*+*`.
 */
const isLocalPartCoveredBySubaddressing = (localPart: string) =>
  hasWildcard(localPart)
    ? isWildcardPatternSubset(localPart, `${wildcard}+${wildcard}`)
    : localPart.includes('+');

/**
 * Checks whether an allowlist item can never pass when subaddressing is blocked.
 */
const isAllowItemCoveredBySubaddressing = (allowItem: string) => {
  const allowParts = getEmailParts(allowItem);

  return Boolean(allowParts?.localPart && isLocalPartCoveredBySubaddressing(allowParts.localPart));
};

/**
 * Validates an email list item.
 *
 * An item can be either a full email address (`foo@example.com`) or a domain entry
 * prefixed with `@` (`@example.com`). `*` can be used inside the local part or
 * domain while keeping the same email/domain shapes.
 *
 * This helper is shared by allowlist and blocklist policies so Console and Core use the same entry
 * format rules.
 */
export const isEmailListItem = (value: string) => {
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
 * Checks whether an email address matches an email list item.
 *
 * Matching is case-insensitive. Domain items (`@example.com`) match only the email
 * domain, while full email items match the complete email address.
 *
 * Wildcard items treat `*` as the only pattern syntax; all other characters are matched literally.
 */
export const matchesEmailListItem = (item: string, email: string) => {
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

/**
 * Checks whether every email address allowed by `allowItem` is denied by `blockItem`.
 *
 * This is used to reject allowlist entries that are fully shadowed by block rules. Partial overlap
 * is allowed; the helper returns `true` only when the block item covers the whole allow item.
 * Malformed inputs return `false` so callers do not report misleading coverage for invalid entries.
 */
export const isEmailListItemFullyCoveredByBlockItem = (allowItem: string, blockItem: string) => {
  if (!isEmailListItem(allowItem) || !isEmailListItem(blockItem)) {
    return false;
  }

  const normalizedAllowItem = allowItem.toLowerCase();
  const normalizedBlockItem = blockItem.toLowerCase();
  const allowParts = getEmailParts(normalizedAllowItem);
  const blockParts = getEmailParts(normalizedBlockItem);

  if (!allowParts || !blockParts) {
    return false;
  }

  if (!blockParts.localPart) {
    return isWildcardPatternSubset(allowParts.domain, blockParts.domain);
  }

  if (!allowParts.localPart) {
    return (
      isWildcardOnly(blockParts.localPart) &&
      isWildcardPatternSubset(allowParts.domain, blockParts.domain)
    );
  }

  return isWildcardPatternSubset(
    `${allowParts.localPart}${emailSeparator}${allowParts.domain}`,
    `${blockParts.localPart}${emailSeparator}${blockParts.domain}`
  );
};

/**
 * Finds allowlist entries that can never be used because block rules fully cover them.
 *
 * Invalid allowlist entries are ignored here because format validation is reported separately by
 * policy validators. Returned items include the first block rule that fully covers each allow entry.
 */
export const findBlockedAllowlistItems = (
  allowlist: readonly string[],
  { blockSubaddressing, customBlocklist = [] }: EmailBlocklistPolicyShape
): BlockedAllowlistItem[] =>
  allowlist.flatMap((allowItem) => {
    if (!isEmailListItem(allowItem)) {
      return [];
    }

    if (blockSubaddressing && isAllowItemCoveredBySubaddressing(allowItem)) {
      return [{ allowItem, blockedBy: 'blockSubaddressing' }];
    }

    const blockedBy = customBlocklist.find((blockItem) =>
      isEmailListItemFullyCoveredByBlockItem(allowItem, blockItem)
    );

    return blockedBy ? [{ allowItem, blockedBy }] : [];
  });

export const isEmailBlocklistItem = isEmailListItem;
export const matchesEmailBlocklistItem = matchesEmailListItem;
