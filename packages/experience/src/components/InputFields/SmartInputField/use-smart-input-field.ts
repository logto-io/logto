import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { useState, useCallback, useMemo } from 'react';
import type { ChangeEventHandler } from 'react';

import useUpdateEffect from '@/hooks/use-update-effect';
import { getDefaultCountryCallingCode } from '@/utils/country-code';
import { parseIdentifierValue } from '@/utils/form';

export type IdentifierInputType =
  | SignInIdentifier.Email
  | SignInIdentifier.Phone
  | SignInIdentifier.Username;

export type IdentifierInputValue = {
  /**
   * The type of the identifier input.
   * `undefined` value is for the case when the user has inputted an identifier but the type is not yet determined in the `SmartInputField`.
   */
  type?: IdentifierInputType;
  /**
   * The value of the identifier input.
   */
  value: string;
};

const digitsRegex = /^\d*$/;

type Props = {
  defaultValue?: string;
  _defaultType?: IdentifierInputType;
  enabledTypes: IdentifierInputType[];
};

const useSmartInputField = ({ _defaultType, defaultValue, enabledTypes }: Props) => {
  const enabledTypeSet = useMemo(() => new Set(enabledTypes), [enabledTypes]);

  assert(
    !_defaultType || enabledTypeSet.has(_defaultType),
    new Error(
      `Invalid input type. Current inputType ${
        _defaultType ?? ''
      } is detected but missing in enabledTypes`
    )
  );

  // Parse default type from enabled types if default type is not provided and only one type is enabled
  const defaultType = useMemo(
    () => _defaultType ?? (enabledTypes.length === 1 ? enabledTypes[0] : undefined),
    [_defaultType, enabledTypes]
  );

  // Parse default value if provided
  const { countryCode: defaultCountryCode, inputValue: defaultInputValue } = useMemo(
    () => parseIdentifierValue(defaultType, defaultValue),
    [defaultType, defaultValue]
  );

  const [currentType, setCurrentType] = useState(defaultType);

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
        return defaultType;
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
    [defaultType, currentType, enabledTypeSet]
  );

  const onCountryCodeChange = useCallback(
    (value: string) => {
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
    setCurrentType(enabledTypeSet.size === 1 ? defaultType : undefined);
  }, [defaultType, enabledTypeSet.size]);

  // CAUTION: For preview use only, enabledTypes and defaultType should not be changed after component mounted
  useUpdateEffect(() => {
    setInputValue('');
    setCurrentType(defaultType);
  }, [defaultType]);

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
