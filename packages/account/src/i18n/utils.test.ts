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

void test('getPreferredLanguage uses the shared SIE language source when auto detecting', () => {
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const storage = new Map([
    ['i18nextAccountCenterLng', 'zh-CN'],
    ['i18nextLogtoUiLng', 'en-US'],
  ]);
  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  };
  const navigator = {
    languages: ['fr'],
    language: 'fr',
  };

  Reflect.defineProperty(globalThis, 'navigator', {
    value: navigator,
    configurable: true,
  });
  Reflect.defineProperty(globalThis, 'window', {
    value: {
      location: {
        hash: '',
        search: '',
      },
      localStorage,
      sessionStorage: localStorage,
      navigator,
    },
    configurable: true,
  });

  try {
    assert.equal(
      getPreferredLanguage({
        languageSettings: {
          autoDetect: true,
          fallbackLanguage: 'fr',
        },
      }),
      'en'
    );
  } finally {
    if (navigatorDescriptor) {
      Reflect.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'navigator');
    }

    if (windowDescriptor) {
      Reflect.defineProperty(globalThis, 'window', windowDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
  }
});
