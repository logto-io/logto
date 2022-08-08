// https://react.i18next.com/latest/typescript#create-a-declaration-file

import { Translation, Errors } from '@logto/phrases';
import { CustomTypeOptions } from 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
    resources: {
      translation: Translation;
      errors: Errors;
    };
  }
}
