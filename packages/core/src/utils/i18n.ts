import { isBuiltInLanguageTag } from '@logto/phrases-experience';
import { type SignInExperience } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import type { i18n } from 'i18next';
import _i18next from 'i18next';
import { type ParameterizedContext } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import detectLanguage from '#src/i18n/detect-language.js';

// This may be fixed by a cjs require wrapper. TBD.
// See https://github.com/microsoft/TypeScript/issues/49189
// eslint-disable-next-line no-restricted-syntax
export const i18next = _i18next as unknown as i18n;

type GetExperienceLanguage = {
  ctx: ParameterizedContext<unknown, IRouterParamContext>;
  languageInfo: SignInExperience['languageInfo'];
  customLanguages: readonly string[];
  lng?: string;
};

export const getExperienceLanguage = ({
  ctx,
  languageInfo: { autoDetect, fallbackLanguage },
  customLanguages,
  lng,
}: GetExperienceLanguage) => {
  const acceptableLanguages = conditionalArray<string | string[]>(
    lng,
    autoDetect && detectLanguage(ctx),
    fallbackLanguage
  );
  const language =
    acceptableLanguages.find((tag) => isBuiltInLanguageTag(tag) || customLanguages.includes(tag)) ??
    'en';
  return language;
};
