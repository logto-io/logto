// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalePhrase } from '@logto/phrases-account-center';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: LocalePhrase;
  }
}
