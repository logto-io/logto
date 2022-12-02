import en from '@logto/phrases-ui/lib/locales/en';
import type { Translation } from '@logto/schemas';

export const flattenTranslation = (
  translation: Translation,
  keyPrefix = ''
): Record<string, string> =>
  Object.keys(translation).reduce((result, key) => {
    const prefix = keyPrefix ? `${keyPrefix}.` : keyPrefix;
    const unwrappedKey = `${prefix}${key}`;
    const unwrapped = translation[key];

    return unwrapped === undefined
      ? result
      : {
          ...result,
          ...(typeof unwrapped === 'string'
            ? { [unwrappedKey]: unwrapped }
            : flattenTranslation(unwrapped, unwrappedKey)),
        };
  }, {});

const emptyTranslation = (translation: Translation): Translation =>
  Object.entries(translation).reduce((result, [key, value]) => {
    return typeof value === 'string'
      ? { ...result, [key]: '' }
      : {
          ...result,
          [key]: emptyTranslation(value),
        };
  }, {});

export const createEmptyUiTranslation = () => emptyTranslation(en.translation);
