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

void test('resolveLanguage resolves manually added (custom) language tags', () => {
  // Vietnamese is not built-in but is in the language-kit catalogue
  assert.equal(resolveLanguage('vi'), 'vi-VN');
  assert.equal(resolveLanguage('vi-VN'), 'vi-VN');
  // Finnish
  assert.equal(resolveLanguage('fi'), 'fi');
  // Still undefined for truly unknown tags
  assert.equal(resolveLanguage('xx'), undefined);
});

void test('resolveUiLocalesLanguage returns the first supported locale with fallback support', () => {
  assert.equal(resolveUiLocalesLanguage('xx pl fr'), 'pl-PL');
  assert.equal(resolveUiLocalesLanguage('zh-HK zh'), 'zh-HK');
  assert.equal(resolveUiLocalesLanguage('xx yy'), undefined);
});

void test('resolveUiLocalesLanguage resolves custom language tags from ui_locales', () => {
  assert.equal(resolveUiLocalesLanguage('xx vi fr'), 'vi-VN');
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

void test('getPreferredLanguage resolves custom fallback language', () => {
  assert.equal(
    getPreferredLanguage({
      languageSettings: {
        autoDetect: false,
        fallbackLanguage: 'vi-VN',
      },
    }),
    'vi-VN'
  );
});
