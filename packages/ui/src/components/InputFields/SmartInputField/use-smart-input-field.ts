import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { useState, useCallback, useMemo } from 'react';
import type { ChangeEventHandler } from 'react';

import { getDefaultCountryCallingCode } from '@/utils/country-code';

export type IdentifierInputType =
  | SignInIdentifier.Email
  | SignInIdentifier.Phone
  | SignInIdentifier.Username;

export type EnabledIdentifierTypes = IdentifierInputType[];

const digitsRegex = /^\d*$/;

type Props = {
  onChange?: (value: string) => void;
  enabledTypes: EnabledIdentifierTypes;
  currentType: IdentifierInputType;
  onTypeChange?: (type: IdentifierInputType) => void;
};

const useSmartInputField = ({ onChange, currentType, enabledTypes, onTypeChange }: Props) => {
  const [countryCode, setCountryCode] = useState<string>(getDefaultCountryCallingCode());
  const [inputValue, setInputValue] = useState<string>('');
  const enabledTypeSet = useMemo(() => new Set(enabledTypes), [enabledTypes]);

  assert(
    enabledTypeSet.has(currentType),
    new Error(
      `Invalid input type. Current inputType ${currentType} is detected but missing in enabledTypes`
    )
  );

  const detectInputType = useCallback(
    (value: string) => {
      if (!value || enabledTypeSet.size === 1) {
        return currentType;
      }

      const hasAtSymbol = value.includes('@');
      const isAllDigits = digitsRegex.test(value);

      const isEmailDetected = enabledTypeSet.has(SignInIdentifier.Email) && hasAtSymbol;

      const isPhoneDetected =
        enabledTypeSet.has(SignInIdentifier.Phone) && value.length > 3 && isAllDigits;

      if (isPhoneDetected) {
        return SignInIdentifier.Phone;
      }

      if (isEmailDetected) {
        return SignInIdentifier.Email;
      }

      if (
        currentType === SignInIdentifier.Email &&
        enabledTypeSet.has(SignInIdentifier.Username) &&
        !hasAtSymbol
      ) {
        return SignInIdentifier.Username;
      }

      if (
        currentType === SignInIdentifier.Phone &&
        enabledTypeSet.has(SignInIdentifier.Username) &&
        !isAllDigits
      ) {
        return SignInIdentifier.Username;
      }

      return currentType;
    },
    [currentType, enabledTypeSet]
  );

  const onCountryCodeChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    ({ target: { value } }) => {
      if (currentType === SignInIdentifier.Phone) {
        const code = value.replace(/\D/g, '');
        setCountryCode(code);
        onChange?.(`${code}${inputValue}`);
      }
    },
    [currentType, inputValue, onChange]
  );

  const onInputValueChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { value } }) => {
      const trimValue = value.trim();
      setInputValue(trimValue);

      const type = detectInputType(trimValue);

      if (type !== currentType) {
        onTypeChange?.(type);
      }

      onChange?.(type === SignInIdentifier.Phone ? `${countryCode}${trimValue}` : trimValue);
    },
    [countryCode, currentType, detectInputType, onChange, onTypeChange]
  );

  const onInputValueClear = useCallback(() => {
    setInputValue('');
    onChange?.('');
  }, [onChange]);

  return {
    countryCode,
    onCountryCodeChange,
    inputValue,
    onInputValueChange,
    onInputValueClear,
  };
};

export default useSmartInputField;
