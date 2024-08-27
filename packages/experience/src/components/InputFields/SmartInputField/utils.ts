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
  'type' | 'pattern' | 'inputMode' | 'placeholder' | 'autoComplete' | 'label'
> => {
  if (currentType === SignInIdentifier.Phone && enabledTypes.length === 1) {
    return {
      type: 'tel',
      pattern: '[0-9]*',
      inputMode: 'numeric',
      autoComplete: 'tel',
      label: i18next.t('input.phone_number'),
    };
  }

  if (currentType === SignInIdentifier.Email && enabledTypes.length === 1) {
    return {
      type: 'email',
      inputMode: 'email',
      autoComplete: 'email',
      label: i18next.t('input.email'),
    };
  }

  return {
    type: 'text',
    autoComplete: enabledTypes
      .map((type) => (type === SignInIdentifier.Phone ? 'tel' : type))
      .join(' '),
    label: enabledTypes.map((type) => i18next.t(identifierInputPlaceholderMap[type])).join(' / '),
  };
};

const digitsRegex = /^\d*$/;

type DetectIdentifierTypeParams = {
  value: string;
  enabledTypeSet: Set<IdentifierInputType>;
  currentType?: IdentifierInputType;
};

export const detectIdentifierType = ({
  value,
  enabledTypeSet,
  currentType,
}: DetectIdentifierTypeParams) => {
  if (!value && enabledTypeSet.size > 1) {
    /**
     * Multiple types are enabled, so we cannot detect the type without the value.
     * Return `undefined` since the type is not determined.
     */
    return;
  }

  if (enabledTypeSet.size === 1) {
    /**
     * Only one type enabled, so we limit the type to the default type.
     */
    return Array.from(enabledTypeSet)[0];
  }

  const hasAtSymbol = value.includes('@');
  const isAllDigits = digitsRegex.test(value);

  if (enabledTypeSet.has(SignInIdentifier.Phone) && value.length >= 3 && isAllDigits) {
    return SignInIdentifier.Phone;
  }

  if (enabledTypeSet.has(SignInIdentifier.Email) && hasAtSymbol) {
    return SignInIdentifier.Email;
  }

  if (currentType === SignInIdentifier.Phone && isAllDigits) {
    return SignInIdentifier.Phone;
  }

  if (enabledTypeSet.has(SignInIdentifier.Username)) {
    return SignInIdentifier.Username;
  }

  if (enabledTypeSet.has(SignInIdentifier.Email)) {
    return SignInIdentifier.Email;
  }

  return currentType;
};
