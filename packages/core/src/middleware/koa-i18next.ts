import i18next from 'i18next';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import detectLanguage from '@/i18n/detect-language';

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
