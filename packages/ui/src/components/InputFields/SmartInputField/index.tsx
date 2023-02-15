import { SignInIdentifier } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import type { HTMLProps, Ref } from 'react';
import { useImperativeHandle, useRef, forwardRef } from 'react';

import ClearIcon from '@/assets/icons/clear-icon.svg';
import IconButton from '@/components/Button/IconButton';

import InputField from '../InputField';
import AnimatedPrefix from './AnimatedPrefix';
import CountryCodeSelector from './CountryCodeSelector';
import type { EnabledIdentifierTypes, IdentifierInputType } from './use-smart-input-field';
import useSmartInputField from './use-smart-input-field';
import { getInputHtmlProps } from './utils';

export type { IdentifierInputType, EnabledIdentifierTypes } from './use-smart-input-field';

type Props = Omit<HTMLProps<HTMLInputElement>, 'onChange' | 'prefix' | 'value'> & {
  className?: string;
  errorMessage?: string;
  isDanger?: boolean;

  enabledTypes?: EnabledIdentifierTypes;
  currentType?: IdentifierInputType;
  onTypeChange?: (type: IdentifierInputType) => void;

  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

const SmartInputField = (
  {
    defaultValue,
    onChange,
    currentType = SignInIdentifier.Username,
    enabledTypes = [currentType],
    onTypeChange,
    ...rest
  }: Props,
  ref: Ref<Nullable<HTMLInputElement>>
) => {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current);

  const { countryCode, onCountryCodeChange, inputValue, onInputValueChange, onInputValueClear } =
    useSmartInputField({
      defaultValue,
      onChange,
      enabledTypes,
      currentType,
      onTypeChange,
    });

  const isPhoneEnabled = enabledTypes.includes(SignInIdentifier.Phone);

  return (
    <InputField
      {...rest}
      ref={innerRef}
      isSuffixFocusVisible={Boolean(inputValue)}
      isPrefixVisible={isPhoneEnabled && currentType === SignInIdentifier.Phone}
      {...getInputHtmlProps(currentType, enabledTypes)}
      value={inputValue}
      prefix={conditional(
        isPhoneEnabled && (
          <AnimatedPrefix isVisible={currentType === SignInIdentifier.Phone}>
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
