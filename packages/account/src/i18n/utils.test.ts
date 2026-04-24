import assert from 'node:assert/strict';
import test from 'node:test';

import type * as I18nUtilsModule from './utils';

const { resolveUiLocalesLanguage, getPreferredLanguage, getPreferredLanguageCandidates } =
  (await import(new URL('utils.ts', import.meta.url).href)) as typeof I18nUtilsModule;

void test('resolveUiLocalesLanguage forwards the first raw ui_locales tag (built-in or custom)', () => {
  assert.equal(resolveUiLocalesLanguage('xx pl fr'), 'xx');
  assert.equal(resolveUiLocalesLanguage('vi-VN en'), 'vi-VN');
  assert.equal(resolveUiLocalesLanguage('   '), undefined);
  assert.equal(resolveUiLocalesLanguage(), undefined);
});

void test('getPreferredLanguage returns the first raw ui_locales candidate before language settings', () => {
  assert.equal(
    getPreferredLanguage({
      uiLocales: 'xx pl',
      languageSettings: {
        autoDetect: false,
        fallbackLanguage: 'fr',
      },
    }),
    'xx'
  );
});

void test('getPreferredLanguageCandidates carries ui_locales + configured fallback when auto-detect is off', () => {
  assert.deepEqual(
    getPreferredLanguageCandidates({
      uiLocales: 'xx pl',
      languageSettings: {
        autoDetect: false,
        fallbackLanguage: 'fi-FI',
      },
    }),
    ['xx', 'pl', 'fi-FI']
  );
});

void test('getPreferredLanguageCandidates preserves custom tags like Vietnamese without filtering', () => {
  assert.deepEqual(
    getPreferredLanguageCandidates({
      uiLocales: 'vi-VN fi-FI en',
      languageSettings: {
        autoDetect: false,
        fallbackLanguage: 'en',
      },
    }),
    ['vi-VN', 'fi-FI', 'en']
  );
});
