import { SignInIdentifier } from '@logto/schemas';
import i18next from 'i18next';
import type { HTMLProps } from 'react';

import { identifierInputPlaceholderMap } from '@/utils/form';

import type { IdentifierInputType } from './use-smart-input-field';

export const getInputHtmlProps = (
  enabledTypes: IdentifierInputType[],
  currentType?: IdentifierInputType
): Pick<
  HTMLProps<HTMLInputElement>,
  'type' | 'pattern' | 'inputMode' | 'placeholder' | 'autoComplete'
> => {
  if (currentType === SignInIdentifier.Phone && enabledTypes.length === 1) {
    return {
      type: 'tel',
      pattern: '[0-9]*',
      inputMode: 'numeric',
      autoComplete: 'tel',
      placeholder: i18next.t('input.phone_number'),
    };
  }

  if (currentType === SignInIdentifier.Email && enabledTypes.length === 1) {
    return {
      type: 'email',
      inputMode: 'email',
      autoComplete: 'email',
      placeholder: i18next.t('input.email'),
    };
  }

  return {
    type: 'text',
    autoComplete: enabledTypes
      .map((type) => (type === SignInIdentifier.Phone ? 'tel' : type))
      .join(' '),
    placeholder: enabledTypes
      .map((type) => i18next.t(identifierInputPlaceholderMap[type]))
      .join(' / '),
  };
};
