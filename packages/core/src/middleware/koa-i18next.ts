import type { i18n } from 'i18next';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import detectLanguage from '#src/i18n/detect-language.js';
import { i18next } from '#src/utils/i18n.js';

type LanguageUtils = {
  formatLanguageCode(code: string): string;
  isSupportedCode(code: string): boolean;
};

export type WithI18nContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    locale: string;
    i18n: i18n;
  };

export default function koaI18next<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT,
>(): MiddlewareType<StateT, WithI18nContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const languages = detectLanguage(ctx);
    // Cannot patch type def directly, see https://github.com/microsoft/TypeScript/issues/36146
    // eslint-disable-next-line no-restricted-syntax
    const languageUtils = i18next.services.languageUtils as LanguageUtils;
    const foundLanguage = languages
      .map((code) => languageUtils.formatLanguageCode(code))
      .find((code) => languageUtils.isSupportedCode(code));

    // Async requests may change the language, so we need to clone a new instance instead of directly updating
    // the global i18next instance. Keep the i18n context scoped to the request.
    // This new instance will be used in the rest of the request lifecycle.
    //
    // Note: This is a shallow clone, so the resources are shared across all instances.
    // This is fine as we only change the language in the cloned instance, and all the language resources are preloaded.
    ctx.i18n = i18next.cloneInstance({ lng: foundLanguage });
    ctx.locale = ctx.i18n.language;

    return next();
  };
}
