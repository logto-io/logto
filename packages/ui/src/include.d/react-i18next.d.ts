// https://react.i18next.com/latest/typescript#create-a-declaration-file

// eslint-disable-next-line import/no-unassigned-import
import 'react-i18next';
import en from '@logto/phrases-ui/lib/locales/en.js';

declare module 'react-i18next' {
  // Official definition
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CustomTypeOptions {
    resources: typeof en;
  }
}
