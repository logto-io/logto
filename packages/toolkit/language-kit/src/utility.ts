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

/**
 * Normalizes a language tag using Intl.getCanonicalLocales.
 * Transforms underscores to hyphens and returns the canonical form.
 * Returns undefined for non-string inputs, empty strings, '*' wildcard, or invalid language tags.
 */
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
  } catch {
    // Intentionally ignore errors - invalid language tags should return undefined
  }
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
  preferred: string[],
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

/**
 * Matches preferred language tags against supported languages.
 * Attempts direct matches first, then falls back to base language matches.
 * Returns undefined when no match is found (unlike findSupportedLanguageTag which returns a default).
 *
 * @param preferred - Iterable of preferred language tags
 * @param supported - Array of supported language tags
 * @returns The matching supported language tag, or undefined if no match is found
 */
export const matchSupportedLanguageTag = (
  preferred: string[],
  supported: readonly string[]
): {
  supportedEntries: SupportedLanguageEntry[];
  match: Optional<SupportedLanguageEntry['original']>;
} => {
  const supportedEntries = buildSupportedEntries(supported);

  return {
    supportedEntries,
    match: findMatchingSupportedLanguage(preferred, supportedEntries)?.original,
  };
};

/**
 * Finds the best matching language tag from preferred languages that is supported.
 * Attempts direct matches first, then falls back to base language matches.
 * If no match is found, returns the default language or a supported version of it.
 *
 * @param preferred - Iterable of preferred language tags (e.g., from Accept-Language header)
 * @param supported - Array of supported language tags
 * @param defaultLanguage - Default language to use when no match is found (default: 'en')
 * @returns The best matching supported language tag
 */
export const findSupportedLanguageTag = (
  preferred: string[],
  supported: readonly string[],
  defaultLanguage = 'en'
): string => {
  const { match: matched, supportedEntries } = matchSupportedLanguageTag(preferred, supported);

  if (matched) {
    return matched;
  }

  const canonicalDefault = canonicalizeLanguageTag(defaultLanguage)?.toLowerCase();

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
