// https://react.i18next.com/latest/typescript#create-a-declaration-file

import { LocalPhrase } from '@logto/phrases';
// eslint-disable-next-line unused-imports/no-unused-imports
import { CustomTypeOptions } from 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
    resources: LocalPhrase;
  }
}
