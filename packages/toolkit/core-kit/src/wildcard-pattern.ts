const wildcard = '*';
const anyOtherCharacter: unique symbol = Symbol('anyOtherCharacter');

type WildcardPattern = readonly string[];
type WildcardPatternCharacter = string | typeof anyOtherCharacter;

/**
 * Returns the finite alphabet used by wildcard subset checks.
 *
 * The subset algorithm only needs characters that appear literally in either pattern, plus the
 * `anyOtherCharacter` sentinel for every other possible input character.
 */
const getLiteralCharacters = (...patterns: string[]): ReadonlySet<string> =>
  new Set(
    patterns.flatMap((pattern) => [...pattern].filter((character) => character !== wildcard))
  );

/**
 * Expands a set of NFA states through zero-length `*` transitions.
 *
 * In this wildcard model, `*` can either consume one input character or advance without consuming
 * anything, which is why the closure includes the following state for every active `*` token.
 */
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

/**
 * Moves a wildcard-pattern NFA by consuming one abstract input character.
 *
 * A literal token only accepts the same real character. The `anyOtherCharacter` sentinel is accepted
 * only by `*`, which lets the subset algorithm cover all characters not explicitly present in the
 * compared patterns.
 */
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

/**
 * Serializes a set of NFA states so paired allow/block states can be de-duplicated.
 */
const serializeStates = (states: ReadonlySet<number>) =>
  [...states]
    .slice()
    .sort((left, right) => left - right)
    .join(',');

/**
 * Returns whether an NFA state set has reached the end of the wildcard pattern.
 */
const isAccepted = (pattern: WildcardPattern, states: ReadonlySet<number>) =>
  states.has(pattern.length);

type StatePair = readonly [ReadonlySet<number>, ReadonlySet<number>];

type PatternSubsetContext = Readonly<{
  allowPattern: WildcardPattern;
  blockPattern: WildcardPattern;
  alphabet: readonly WildcardPatternCharacter[];
}>;

/**
 * Searches for an input accepted by the allow pattern but not accepted by the block pattern.
 *
 * Returning `true` means the allow pattern is not fully covered. Returning `false` means every
 * reachable accepted allow state is also accepted by the block pattern.
 */
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

/**
 * Checks whether every string matched by `allowPattern` is also matched by `blockPattern`.
 *
 * The supported pattern syntax is intentionally small: only `*` is special and it matches any
 * sequence of characters. The implementation uses a small NFA subset construction over the literal
 * characters in the two patterns plus `anyOtherCharacter`, avoiding infinite character enumeration
 * while still covering unknown input.
 */
export const isWildcardPatternSubset = (allowPattern: string, blockPattern: string) => {
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
