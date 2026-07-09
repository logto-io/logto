import { emailOrEmailDomainRegEx } from './regex.js';

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
const anyOtherCharacter: unique symbol = Symbol('anyOtherCharacter');

type WildcardPattern = readonly string[];
type WildcardPatternCharacter = string | typeof anyOtherCharacter;

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

const getLiteralCharacters = (...patterns: string[]): ReadonlySet<string> =>
  new Set(
    patterns.flatMap((pattern) => [...pattern].filter((character) => character !== wildcard))
  );

const epsilonClosure = (
  pattern: WildcardPattern,
  states: ReadonlySet<number>
): ReadonlySet<number> => {
  /* eslint-disable @silverhand/fp/no-mutating-methods -- finite automata traversal uses local queue state */
  const closedStates = new Set(states);
  const pendingStates = [...states];

  for (const state of pendingStates) {
    if (pattern[state] === wildcard && !closedStates.has(state + 1)) {
      closedStates.add(state + 1);
      pendingStates.push(state + 1);
    }
  }

  return closedStates;
  /* eslint-enable @silverhand/fp/no-mutating-methods */
};

const move = (
  pattern: WildcardPattern,
  states: ReadonlySet<number>,
  character: WildcardPatternCharacter
): ReadonlySet<number> => {
  const nextStates = [...states].flatMap((state) => {
    const token = pattern[state];

    if (!token) {
      return [];
    }

    if (token === wildcard) {
      return [state];
    }

    if (character !== anyOtherCharacter && token === character) {
      return [state + 1];
    }

    return [];
  });

  return epsilonClosure(pattern, new Set(nextStates));
};

const serializeStates = (states: ReadonlySet<number>) =>
  [...states]
    .slice()
    .sort((left, right) => left - right)
    .join(',');

const isAccepted = (pattern: WildcardPattern, states: ReadonlySet<number>) =>
  states.has(pattern.length);

type StatePair = readonly [ReadonlySet<number>, ReadonlySet<number>];

type PatternSubsetContext = Readonly<{
  allowPattern: WildcardPattern;
  blockPattern: WildcardPattern;
  alphabet: readonly WildcardPatternCharacter[];
}>;

const hasUncoveredAcceptedState = (
  context: PatternSubsetContext,
  initialPendingPairs: readonly StatePair[]
): boolean => {
  const { allowPattern, alphabet, blockPattern } = context;

  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods -- finite automata traversal uses local queue/set state */
  const pendingPairs = [...initialPendingPairs];
  const visitedPairs = new Set<string>();
  let index = 0;

  while (index < pendingPairs.length) {
    const statePair = pendingPairs[index];
    index += 1;

    if (!statePair) {
      continue;
    }

    const [allowStates, blockStates] = statePair;
    const pairKey = `${serializeStates(allowStates)}|${serializeStates(blockStates)}`;

    if (visitedPairs.has(pairKey)) {
      continue;
    }

    visitedPairs.add(pairKey);

    if (isAccepted(allowPattern, allowStates) && !isAccepted(blockPattern, blockStates)) {
      return true;
    }

    const nextPairs = alphabet.flatMap((character): StatePair[] => {
      const nextAllowStates = move(allowPattern, allowStates, character);

      return nextAllowStates.size > 0
        ? [[nextAllowStates, move(blockPattern, blockStates, character)]]
        : [];
    });

    pendingPairs.push(...nextPairs);
  }

  return false;
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */
};

const isWildcardPatternSubset = (allowPattern: string, blockPattern: string) => {
  const alphabet: readonly WildcardPatternCharacter[] = [
    ...getLiteralCharacters(allowPattern, blockPattern),
    anyOtherCharacter,
  ];
  const allowPatternCharacters = [...allowPattern];
  const blockPatternCharacters = [...blockPattern];
  const initialAllowStates = epsilonClosure(allowPatternCharacters, new Set([0]));
  const initialBlockStates = epsilonClosure(blockPatternCharacters, new Set([0]));
  const initialPair = [initialAllowStates, initialBlockStates] as const;

  return !hasUncoveredAcceptedState(
    { allowPattern: allowPatternCharacters, alphabet, blockPattern: blockPatternCharacters },
    [initialPair]
  );
};

const isWildcardOnly = (pattern: string) =>
  [...pattern].every((character) => character === wildcard);

const isLocalPartCoveredBySubaddressing = (localPart: string) =>
  hasWildcard(localPart)
    ? isWildcardPatternSubset(localPart, `${wildcard}+${wildcard}`)
    : localPart.includes('+');

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
