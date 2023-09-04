import { conditionalArray } from '@silverhand/essentials';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Returns whether the given character is a CJK character.
 *
 * @see https://stackoverflow.com/questions/43418812
 */
const isCjk = (char?: string) =>
  Boolean(
    char?.[0] && /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF66-\uFF9F]/.test(char[0])
  );

/**
 * Returns a function that translates a list of strings into a human-readable list. If the list
 * is empty, `undefined` is returned.
 *
 * For non-CJK languages, the list is translated with the Oxford comma. For CJK languages, the
 * list is translated with the AP style.
 *
 * CAUTION: This function may not be suitable for translating lists of non-English strings if the
 * target language does not have the same rules for list translation as English.
 *
 * @example
 * ```ts
 * const translateList = useListTranslation();
 *
 * // en
 * translateList([]); // undefined
 * translateList(['a']); // 'a'
 * translateList(['a', 'b']); // 'a and b'
 * translateList(['a', 'b', 'c']); // 'a, b, or c'
 * translateList(['a', 'b', 'c'], 'and'); // 'a, b, and c'
 *
 * // zh
 * translateList(['a', 'b']); // 'a 或 b'
 * translateList(['苹果', '橘子', '香蕉']); // '苹果、橘子或香蕉'
 * translateList(['苹果', '橘子', 'banana']); // '苹果、橘子或 banana'
 * ```
 */
const useListTranslation = () => {
  const { t } = useTranslation();

  return useCallback(
    (list: string[], joint: 'or' | 'and' = 'or') => {
      if (list.length === 0) {
        return;
      }

      if (list.length === 1) {
        return list[0];
      }

      const prefix = list.slice(0, -1).join(t('list.separator'));
      const suffix = list.at(-1)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- `list` is not empty
      const jointT = t(`list.${joint}`);

      if (!isCjk(jointT)) {
        // Oxford comma
        return `${prefix}${t(`list.separator`)}${jointT}${suffix}`;
      }

      return conditionalArray(
        prefix,
        isCjk(prefix.at(-1)) && ' ',
        jointT,
        isCjk(suffix[0]) && ' ',
        suffix
      ).join('');
    },
    [t]
  );
};

export default useListTranslation;
