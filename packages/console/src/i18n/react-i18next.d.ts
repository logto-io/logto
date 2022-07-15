import { Translation, Errors } from '@logto/phrases';
import { CustomTypeOptions } from 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: Translation;
      errors: Errors;
    };
  }
}
