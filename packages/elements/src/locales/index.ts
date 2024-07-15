import { type en } from './en.js';

type KeyPath<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends Record<string, unknown>
          ? `${K}.${KeyPath<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : '';

/** The type of a full locale data object. */
export type LocaleData = typeof en;

/**
 * The type of a locale key. It is a string that represents a path to a value in the locale data
 * object.
 *
 * @example
 * With the following locale data object:
 *
 * ```ts
 * const en = {
 *   profile: {
 *     title: 'Profile',
 *     description: 'Your profile',
 *   },
 * };
 * ```
 *
 * The locale key for the title would be `'profile.title'`.
 */
export type LocaleKey = KeyPath<LocaleData>;

/**
 * The type of a locale key that is optional. Note that it uses an empty string to represent the
 * absence of a key since Web Components do not support `undefined` as a property value.
 */
export type LocaleKeyOptional = LocaleKey | '';
