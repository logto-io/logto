import { type Optional } from '@silverhand/essentials';
import { z, any } from 'zod';

import { languages } from './const.js';
import type { LanguageTag } from './type.js';

export const isLanguageTag = (value: unknown): value is LanguageTag =>
  typeof value === 'string' &&
  Object.keys(languages)
    .map((key) => key.toLowerCase())
    .includes(value.toLowerCase());

export const languageTagGuard: z.ZodType<LanguageTag> = z
  .any()
  .refine((value: unknown) => isLanguageTag(value));

export const canonicalizeLanguageTag = (language: string): Optional<string> => {
  if (typeof language !== 'string') {
    return;
  }

  const trimmed = language.trim();

  if (!trimmed || trimmed === '*') {
    return;
  }

  try {
    const [canonical] = Intl.getCanonicalLocales(trimmed.replaceAll('_', '-'));

    return canonical;
  } catch {}
};

type SupportedLanguageEntry = {
  original: string;
  canonical: string;
  base: string;
};

const isNonNullable = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined;

const toSupportedLanguageEntry = (language: string): Optional<SupportedLanguageEntry> => {
  const canonical = canonicalizeLanguageTag(language);

  if (!canonical) {
    return;
  }

  const base = canonical.split('-')[0] ?? canonical;

  return {
    original: language,
    canonical: canonical.toLowerCase(),
    base: base.toLowerCase(),
  };
};

const findMatchingSupportedLanguage = (
  preferred: Iterable<string>,
  supportedEntries: SupportedLanguageEntry[]
): Optional<SupportedLanguageEntry> => {
  for (const language of preferred) {
    const canonicalPreferred = canonicalizeLanguageTag(language)?.toLowerCase();

    if (!canonicalPreferred) {
      continue;
    }

    const directMatch = supportedEntries.find((entry) => entry.canonical === canonicalPreferred);

    if (directMatch) {
      return directMatch;
    }

    const base = canonicalPreferred.split('-')[0] ?? canonicalPreferred;

    if (!base) {
      continue;
    }

    const baseMatch = supportedEntries.find((entry) => entry.base === base);

    if (baseMatch) {
      return baseMatch;
    }
  }
};

const buildSupportedEntries = (supported: readonly string[]): SupportedLanguageEntry[] =>
  supported
    .map((language) => toSupportedLanguageEntry(language))
    .filter((entry): entry is SupportedLanguageEntry => isNonNullable(entry));

export const matchSupportedLanguageTag = (
  preferred: Iterable<string>,
  supported: readonly string[]
): Optional<string> => {
  const supportedEntries = buildSupportedEntries(supported);

  return findMatchingSupportedLanguage(preferred, supportedEntries)?.original;
};

export const findSupportedLanguageTag = (
  preferred: Iterable<string>,
  supported: readonly string[],
  defaultLanguage = 'en'
): string => {
  const supportedEntries = buildSupportedEntries(supported);
  const canonicalDefault = canonicalizeLanguageTag(defaultLanguage)?.toLowerCase();

  const matched = findMatchingSupportedLanguage(preferred, supportedEntries);

  if (matched) {
    return matched.original;
  }

  const defaultMatch = canonicalDefault
    ? (supportedEntries.find((entry) => entry.canonical === canonicalDefault)?.original ??
      supportedEntries.find((entry) => entry.base === canonicalDefault)?.original)
    : undefined;

  return defaultMatch ?? defaultLanguage;
};

/**
 * https://github.com/colinhacks/zod/issues/316#issuecomment-850906479
 * Create a schema matches anything and returns a value. Use it with `or`:
 *
 * const schema = zod.number();
 * const tolerant = schema.or(fallback(-1));
 *
 * schema.parse('foo')      // => ZodError
 * tolerant.parse('foo')    // -1
 */
export function fallback<T>(value: T) {
  return any().transform(() => value);
}
