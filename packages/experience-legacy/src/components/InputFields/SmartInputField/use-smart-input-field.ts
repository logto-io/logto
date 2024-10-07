import { SignInIdentifier } from '@logto/schemas';
import { useState, useCallback, useMemo } from 'react';
import type { ChangeEventHandler } from 'react';

import { getDefaultCountryCallingCode } from '@/utils/country-code';
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
};

const useSmartInputField = ({ defaultValue, enabledTypes }: Props) => {
  const enabledTypeSet = useMemo(() => new Set(enabledTypes), [enabledTypes]);

  // Parse default type from enabled types and default value
  const defaultType = useMemo(
    () => detectIdentifierType({ value: defaultValue ?? '', enabledTypeSet }),
    [defaultValue, enabledTypeSet]
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
