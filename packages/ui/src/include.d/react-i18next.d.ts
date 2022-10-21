// https://react.i18next.com/latest/typescript#create-a-declaration-file

// eslint-disable-next-line import/no-unassigned-import
import 'react-i18next';
import type en from '@logto/phrases-ui/lib/locales/en.js';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
    resources: typeof en;
  }
}
