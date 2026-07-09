import { emailRegEx } from '@logto/core-kit';
import { SignInIdentifier, type UsernamePolicy } from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared/universal';
import i18next from 'i18next';
import type { TFuncKey } from 'i18next';
import { ParseError } from 'libphonenumber-js/mobile';

import type { ErrorType } from '@/shared/components/ErrorMessage';
import type { IdentifierInputType } from '@/shared/components/InputFields/SmartInputField';
import { validateUsername } from '@/shared/utils/validate-username';
import { parsePhoneNumber } from '@/utils/country-code';

const { t } = i18next;

export const validateEmail = (email: string): ErrorType | undefined => {
  if (!emailRegEx.test(email)) {
    return 'invalid_email';
  }
};

export const validatePhone = (value: string): ErrorType | undefined => {
  try {
    const phoneNumber = PhoneNumberParser.parse(value);

    if (!phoneNumber.isValid()) {
      return 'invalid_phone';
    }
  } catch (error: unknown) {
    if (error instanceof ParseError) {
      return 'invalid_phone';
    }

    throw error;
  }
};

export const validateIdentifierField = (
  type: IdentifierInputType,
  value: string,
  usernamePolicy?: UsernamePolicy
) => {
  switch (type) {
    case SignInIdentifier.Username: {
      return validateUsername(value, usernamePolicy);
    }

    case SignInIdentifier.Email: {
      return validateEmail(value);
    }

    case SignInIdentifier.Phone: {
      return validatePhone(value);
    }
  }
};

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
    types: enabledFields.map((field) => t(identifierInputDescriptionMap[field])),
  };

  const code = type === 'required' ? 'error.general_required' : 'error.general_invalid';

  return t(code, data);
};

/**
 * Try to interpret a value as a full international phone number (e.g. a pasted or stored
 * E.164 number like `+8613800138000`), splitting it into the country calling code and the
 * national number. Returns `undefined` when the value does not parse into a national number,
 * so callers can fall back to treating it as a plain input value.
 */
export const parsePhoneIdentifier = (value: string) => {
  const phoneNumber = parsePhoneNumber(value);

  if (phoneNumber?.nationalNumber) {
    return {
      countryCode: phoneNumber.countryCallingCode,
      inputValue: phoneNumber.nationalNumber,
    };
  }
};

export const parseIdentifierValue = (type?: IdentifierInputType, value?: string) => {
  if (type === SignInIdentifier.Phone && value) {
    const phoneIdentifier = parsePhoneIdentifier(value);

    if (phoneIdentifier) {
      return {
        countryCode: phoneIdentifier.countryCode,
        inputValue: phoneIdentifier.inputValue,
      };
    }
  }

  return {
    inputValue: value,
  };
};

export { validateUsername } from '@/shared/utils/validate-username';
