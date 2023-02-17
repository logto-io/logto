import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { useState, useCallback, useMemo } from 'react';
import type { ChangeEventHandler } from 'react';

import { getDefaultCountryCallingCode } from '@/utils/country-code';
import { parseIdentifierValue } from '@/utils/form';

export type IdentifierInputType =
  | SignInIdentifier.Email
  | SignInIdentifier.Phone
  | SignInIdentifier.Username;

export type IdentifierInputValue = {
  type: IdentifierInputType | undefined;
  value: string;
};

const digitsRegex = /^\d*$/;

type Props = {
  defaultValue?: string;
  defaultType?: IdentifierInputType;
  enabledTypes: IdentifierInputType[];
};

const useSmartInputField = ({ defaultType, defaultValue, enabledTypes }: Props) => {
  const enabledTypeSet = useMemo(() => new Set(enabledTypes), [enabledTypes]);

  if (defaultType) {
    assert(
      enabledTypeSet.has(defaultType),
      new Error(
        `Invalid input type. Current inputType ${defaultType} is detected but missing in enabledTypes`
      )
    );
  }

  // Parse default value from enabled types if default type is not provided and only one type is enabled
  const _defaultType = useMemo(
    () => defaultType ?? (enabledTypes.length === 1 ? enabledTypes[0] : undefined),
    [defaultType, enabledTypes]
  );

  // Parse default value if provided
  const { countryCode: defaultCountryCode, inputValue: defaultInputValue } = useMemo(
    () => parseIdentifierValue(_defaultType, defaultValue),
    [_defaultType, defaultValue]
  );

  const [currentType, setCurrentType] = useState(_defaultType);

  const [countryCode, setCountryCode] = useState<string>(
    defaultCountryCode ?? getDefaultCountryCallingCode()
  );

  const [inputValue, setInputValue] = useState<string>(defaultInputValue ?? '');

  const detectInputType = useCallback(
    (value: string) => {
      // Reset InputType
      if (!value && enabledTypeSet.size > 1) {
        return;
      }

      if (enabledTypeSet.size === 1) {
        return _defaultType;
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
    },
    [_defaultType, currentType, enabledTypeSet]
  );

  const onCountryCodeChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    ({ target: { value } }) => {
      if (currentType === SignInIdentifier.Phone) {
        const code = value.replace(/\D/g, '');
        setCountryCode(code);
      }
    },
    [currentType]
  );

  const onInputValueChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { value } }) => {
      const trimValue = value.trim();
      setInputValue(trimValue);

      const type = detectInputType(trimValue);
      setCurrentType(type);
    },
    [detectInputType]
  );

  const onInputValueClear = useCallback(() => {
    setInputValue('');
    setCurrentType(enabledTypeSet.size === 1 ? _defaultType : undefined);
  }, [_defaultType, enabledTypeSet.size]);

  return {
    countryCode,
    onCountryCodeChange,
    inputValue,
    onInputValueChange,
    onInputValueClear,
    identifierType: currentType,
  };
};

export default useSmartInputField;
