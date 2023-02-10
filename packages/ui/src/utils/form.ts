import { SignInIdentifier } from '@logto/schemas';
import i18next from 'i18next';
import type { TFuncKey } from 'react-i18next';

import type { IdentifierInputType } from '@/components/InputFields';

import { validateUsername, validateEmail, validatePhone } from './field-validations';

const { t } = i18next;

export const identifierInputPlaceholderMap: { [K in IdentifierInputType]: TFuncKey } = {
  [SignInIdentifier.Phone]: 'input.phone_number',
  [SignInIdentifier.Email]: 'input.email',
  [SignInIdentifier.Username]: 'input.username',
};

export const identifierInputDescriptionMap: { [K in IdentifierInputType]: TFuncKey } = {
  [SignInIdentifier.Phone]: 'description.phone_number',
  [SignInIdentifier.Email]: 'description.email',
  [SignInIdentifier.Username]: 'description.username',
};

export const getGeneralIdentifierErrorMessage = (
  enabledFields: IdentifierInputType[],
  type: 'required' | 'invalid'
) => {
  const data = {
    types: enabledFields.map((field) =>
      t<'translation', TFuncKey>(identifierInputDescriptionMap[field])
    ),
  };

  const code = type === 'required' ? 'error.general_required' : 'error.general_invalid';

  return t<'translation', TFuncKey>(code, data);
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
