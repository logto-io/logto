// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalePhrase } from '@logto/phrases-ui';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
    resources: LocalePhrase;
  }
}
