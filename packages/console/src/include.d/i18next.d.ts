// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalePhrase } from '@logto/phrases';
import type { LocalePhrase as ExperiencePhrase } from '@logto/phrases-experience';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: LocalePhrase & {
      experience: ExperiencePhrase['translation'];
    };
  }
}
