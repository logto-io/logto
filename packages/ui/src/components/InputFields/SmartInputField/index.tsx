import { SignInIdentifier } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import type { HTMLProps, Ref } from 'react';
import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

import ClearIcon from '@/assets/icons/clear-icon.svg';
import IconButton from '@/components/Button/IconButton';

import InputField from '../InputField';
import AnimatedPrefix from './AnimatedPrefix';
import CountryCodeSelector from './CountryCodeSelector';
import type { IdentifierInputType, IdentifierInputValue } from './use-smart-input-field';
import useSmartInputField from './use-smart-input-field';
import { getInputHtmlProps } from './utils';

export type { IdentifierInputType, IdentifierInputValue } from './use-smart-input-field';

type Props = Omit<HTMLProps<HTMLInputElement>, 'onChange' | 'prefix' | 'value'> & {
  className?: string;
  errorMessage?: string;
  isDanger?: boolean;

  enabledTypes?: IdentifierInputType[];
  defaultType?: IdentifierInputType;

  defaultValue?: string;
  onChange?: (data: IdentifierInputValue) => void;
};

const SmartInputField = (
  { defaultValue, defaultType, enabledTypes = [], onChange, ...rest }: Props,
  ref: Ref<Nullable<HTMLInputElement>>
) => {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current);

  const {
    countryCode,
    onCountryCodeChange,
    inputValue,
    onInputValueChange,
    onInputValueClear,
    identifierType,
  } = useSmartInputField({
    _defaultType: defaultType,
    defaultValue,
    enabledTypes,
  });

  const isPhoneEnabled = enabledTypes.includes(SignInIdentifier.Phone);

  useEffect(() => {
    onChange?.({
      type: identifierType,
      value:
        identifierType === SignInIdentifier.Phone && inputValue
          ? `${countryCode}${inputValue}`
          : inputValue,
    });
  }, [countryCode, identifierType, inputValue, onChange]);

  return (
    <InputField
      {...rest}
      ref={innerRef}
      isSuffixFocusVisible={Boolean(inputValue)}
      isPrefixVisible={identifierType === SignInIdentifier.Phone}
      {...getInputHtmlProps(enabledTypes, identifierType)}
      value={inputValue}
      prefix={conditional(
        isPhoneEnabled && (
          <AnimatedPrefix isVisible={identifierType === SignInIdentifier.Phone}>
            <CountryCodeSelector
              value={countryCode}
              onChange={(event) => {
                onCountryCodeChange(event);
                innerRef.current?.focus();
              }}
            />
          </AnimatedPrefix>
        )
      )}
      suffix={
        <IconButton
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={onInputValueClear}
        >
          <ClearIcon />
        </IconButton>
      }
      onChange={onInputValueChange}
    />
  );
};

export default forwardRef(SmartInputField);
