import assert from 'node:assert/strict';
import test from 'node:test';

import type { LanguageInfo } from '@logto/schemas';

void test('prefers the first supported ui_locales language over fallback settings', async () => {
  const { getPreferredLanguage } = await import('../src/i18n/utils.ts');
  const languageSettings = {
    autoDetect: false,
    fallbackLanguage: 'en',
  } satisfies LanguageInfo;

  assert.equal(getPreferredLanguage({ languageSettings, uiLocales: 'fr-CA fr en' }), 'fr');
});

void test('falls back to configured language when ui_locales has no supported built-in language', async () => {
  const { getPreferredLanguage } = await import('../src/i18n/utils.ts');
  const languageSettings = {
    autoDetect: false,
    fallbackLanguage: 'ja',
  } satisfies LanguageInfo;

  assert.equal(getPreferredLanguage({ languageSettings, uiLocales: 'fr-CA' }), 'ja');
});
