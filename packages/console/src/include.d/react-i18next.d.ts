// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalPhrase } from '@logto/phrases';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
    resources: LocalPhrase;
  }
}
