import { IncomingHttpHeaders } from 'http';

import { Optional, normalizeValueToStringArray } from '@silverhand/essentials';
import { ParameterizedContext } from 'koa';
import { IRouterParamContext } from 'koa-router';

/**
 * Resolve language and its q value from string.
 * @param languageString The language string in header, e.g. 'en-GB;q=0.8', 'zh-CN'
 * @returns `[language, q]`, e.g. `['en-GB', 0.8]`; `undefined` if no language is detected.
 */
const resolveLanguage = (languageString: string): Optional<[string, number]> => {
  // Edited from https://github.com/lxzxl/koa-i18next-detector/blob/master/src/lookups/header.js
  const [language, ...rest] = languageString.split(';');

  if (!language) {
    return;
  }

  for (const item of rest) {
    const [key, value] = item.split('=');

    if (key === 'q' && !Number.isNaN(value)) {
      return [language, Number(value)];
    }
  }

  return [language, 1];
};

const detectLanguageFromHeaders = (headers: IncomingHttpHeaders): string[] =>
  headers['accept-language']
    ?.split(',')
    .map((string) => resolveLanguage(string))
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    .filter((value): value is NonNullable<typeof value> => Boolean(value))
    .slice()
    .sort((lng1, lng2) => lng2[1] - lng1[1])
    .map(([locale]) => locale) ?? [];

const detectLanguage = <StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  ctx: ParameterizedContext<StateT, ContextT, ResponseBodyT>
): string[] => [
  ...normalizeValueToStringArray(ctx.query.locale),
  ...detectLanguageFromHeaders(ctx.headers),
];

export default detectLanguage;
