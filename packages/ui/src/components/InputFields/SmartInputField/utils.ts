import { SignInIdentifier } from '@logto/schemas';
import i18next from 'i18next';
import type { HTMLProps } from 'react';
import type { TFuncKey } from 'react-i18next';

import type { IdentifierInputType, EnabledIdentifierTypes } from './use-smart-input-field';

const identifierInputPlaceholderMap: { [K in IdentifierInputType]: TFuncKey } = {
  [SignInIdentifier.Phone]: 'input.phone_number',
  [SignInIdentifier.Email]: 'input.email',
  [SignInIdentifier.Username]: 'input.username',
};

export const getInputHtmlProps = (
  currentType: IdentifierInputType,
  enabledTypes: EnabledIdentifierTypes
): Pick<HTMLProps<HTMLInputElement>, 'type' | 'pattern' | 'inputMode' | 'placeholder'> => {
  if (currentType === SignInIdentifier.Phone && enabledTypes.length === 1) {
    return {
      type: 'tel',
      pattern: '[0-9]*',
      inputMode: 'numeric',
      placeholder: i18next.t<'translation', TFuncKey>('input.phone_number'),
    };
  }

  if (currentType === SignInIdentifier.Email && enabledTypes.length === 1) {
    return {
      type: 'email',
      inputMode: 'email',
      placeholder: i18next.t<'translation', TFuncKey>('input.email'),
    };
  }

  return {
    type: 'text',
    placeholder: enabledTypes
      .map((type) => i18next.t<'translation', TFuncKey>(identifierInputPlaceholderMap[type]))
      .join(' / '),
  };
};
