import { SignInIdentifier } from '@logto/schemas';
import { getCountryCallingCode } from 'libphonenumber-js/mobile';
import { useState, useCallback, useMemo } from 'react';
import type { ChangeEventHandler } from 'react';

import { getDefaultCountryCallingCode, isValidCountryCode } from '@/utils/country-code';
import { parseIdentifierValue } from '@/utils/form';

import { detectIdentifierType } from './utils';

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

type Props = {
  defaultValue?: string;
  enabledTypes: IdentifierInputType[];
  defaultCountryCode?: string;
};

const useSmartInputField = ({ defaultValue, enabledTypes, defaultCountryCode }: Props) => {
  const enabledTypeSet = useMemo(() => new Set(enabledTypes), [enabledTypes]);

  // Parse default type from enabled types and default value
  const defaultType = useMemo(
    () => detectIdentifierType({ value: defaultValue ?? '', enabledTypeSet }),
    [defaultValue, enabledTypeSet]
  );

  // Parse default value if provided
  const { countryCode: parsedCountryCode, inputValue: defaultInputValue } = useMemo(
    () => parseIdentifierValue(defaultType, defaultValue),
    [defaultType, defaultValue]
  );

  const [currentType, setCurrentType] = useState(defaultType);

  // Convert the ISO 3166-1 alpha-2 country code prop (e.g. "AU") to a calling code (e.g. "61")
  const defaultCallingCode = useMemo(() => {
    if (!defaultCountryCode) {
      return undefined;
    }
    const upperCode = defaultCountryCode.toUpperCase();
    return isValidCountryCode(upperCode) ? getCountryCallingCode(upperCode) : undefined;
  }, [defaultCountryCode]);

  const [countryCode, setCountryCode] = useState<string>(
    parsedCountryCode ?? defaultCallingCode ?? getDefaultCountryCallingCode()
  );

  const [inputValue, setInputValue] = useState<string>(defaultInputValue ?? '');

  const detectInputType = useCallback(
    (value: string) => detectIdentifierType({ value, enabledTypeSet, currentType }),
    [currentType, enabledTypeSet]
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
