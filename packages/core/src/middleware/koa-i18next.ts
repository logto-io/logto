import type { i18n } from 'i18next';
import _i18next from 'i18next';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import detectLanguage from '#src/i18n/detect-language.js';

// This may be fixed by a cjs require wrapper. TBD.
// See https://github.com/microsoft/TypeScript/issues/49189
// eslint-disable-next-line no-restricted-syntax
const i18next = _i18next as unknown as i18n;

type LanguageUtils = {
  formatLanguageCode(code: string): string;
  isSupportedCode(code: string): boolean;
};

export type WithI18nContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    locale: string;
  };

export default function koaI18next<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithI18nContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const languages = detectLanguage(ctx);
    // Cannot patch type def directly, see https://github.com/microsoft/TypeScript/issues/36146
    // eslint-disable-next-line no-restricted-syntax
    const languageUtils = i18next.services.languageUtils as LanguageUtils;
    const foundLanguage = languages
      .map((code) => languageUtils.formatLanguageCode(code))
      .find((code) => languageUtils.isSupportedCode(code));

    await i18next.changeLanguage(foundLanguage);
    ctx.locale = i18next.language;

    return next();
  };
}
