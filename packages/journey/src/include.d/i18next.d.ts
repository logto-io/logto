// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalePhrase } from '../../../phrases-journey/lib';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: LocalePhrase;
  }
}
