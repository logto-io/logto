// https://react.i18next.com/latest/typescript#create-a-declaration-file

// eslint-disable-next-line import/no-unassigned-import
import 'react-i18next';
import en from '@/locales/en.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: typeof en;
  }
}
