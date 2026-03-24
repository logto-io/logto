import assert from 'node:assert/strict';
import test from 'node:test';

import type * as I18nUtilsModule from './utils';

const { resolveLanguage, resolveUiLocalesLanguage, getPreferredLanguage } = (await import(
  new URL('utils.ts', import.meta.url).href
)) as typeof I18nUtilsModule;

void test('resolveLanguage returns the best supported built-in language', () => {
  assert.equal(resolveLanguage('pl'), 'pl-PL');
  assert.equal(resolveLanguage('zh-HK'), 'zh-HK');
  assert.equal(resolveLanguage('xx'), undefined);
});

void test('resolveUiLocalesLanguage returns the first supported locale with fallback support', () => {
  assert.equal(resolveUiLocalesLanguage('xx pl fr'), 'pl-PL');
  assert.equal(resolveUiLocalesLanguage('zh-HK zh'), 'zh-HK');
  assert.equal(resolveUiLocalesLanguage('xx yy'), undefined);
});

void test('getPreferredLanguage respects ui_locales fallback before language settings', () => {
  assert.equal(
    getPreferredLanguage({
      uiLocales: 'xx pl',
      languageSettings: {
        autoDetect: false,
        fallbackLanguage: 'fr',
      },
    }),
    'pl-PL'
  );
});
