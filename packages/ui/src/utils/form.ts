import { SignInIdentifier } from '@logto/schemas';
import i18next from 'i18next';
import type { FieldError } from 'react-hook-form';
import type { TFuncKey } from 'react-i18next';

import type { ErrorType } from '@/components/ErrorMessage';
import type { IdentifierInputType } from '@/components/InputFields';

import { validateUsername, validateEmail, validatePhone } from './field-validations';

// eslint-disable-next-line id-length
const t = (key: TFuncKey) => i18next.t<'translation', TFuncKey>(key);

export const identifierInputPlaceholderMap: { [K in IdentifierInputType]: TFuncKey } = {
  [SignInIdentifier.Phone]: 'input.phone_number',
  [SignInIdentifier.Email]: 'input.email',
  [SignInIdentifier.Username]: 'input.username',
};

export const passwordErrorWatcher = (error?: FieldError): ErrorType | undefined => {
  switch (error?.type) {
    case 'required':
      return 'password_required';
    case 'minLength':
      return { code: 'password_min_length', data: { min: 6 } };
    default:
  }
};

export const identifierErrorWatcher = (
  enabledFields: IdentifierInputType[],
  error?: FieldError
): ErrorType | undefined => {
  const data = { types: enabledFields.map((field) => t(identifierInputPlaceholderMap[field])) };

  switch (error?.type) {
    case 'required':
      return {
        code: 'general_required',
        data,
      };
    case 'validate':
      return {
        code: 'general_invalid',
        data,
      };
    default:
  }
};

export const validateIdentifierField = (type: IdentifierInputType, value: string) => {
  switch (type) {
    case 'username':
      return validateUsername(value);

    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    default:
  }
};
