// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalePhrase } from '@logto/phrases';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    allowObjectInHTMLChildren: true;
    resources: LocalePhrase;
  }
}
