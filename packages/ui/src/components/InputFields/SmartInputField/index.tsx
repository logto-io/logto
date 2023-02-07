import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { ForwardedRef, HTMLProps } from 'react';
import { forwardRef } from 'react';

import ClearIcon from '@/assets/icons/clear-icon.svg';
import IconButton from '@/components/Button/IconButton';
import type { ErrorType } from '@/components/ErrorMessage';

import InputField from '../InputField';
import AnimatedPrefix from './AnimatedPrefix';
import CountryCodeSelector from './CountryCodeSelector';
import type { EnabledIdentifierTypes, IdentifierInputType } from './use-smart-input-field';
import useSmartInputField from './use-smart-input-field';

export type { IdentifierInputType, EnabledIdentifierTypes } from './use-smart-input-field';

type Props = Omit<HTMLProps<HTMLInputElement>, 'onChange' | 'prefix'> & {
  className?: string;
  error?: ErrorType;
  isDanger?: boolean;

  enabledTypes?: EnabledIdentifierTypes;
  currentType?: IdentifierInputType;
  onTypeChange?: (type: IdentifierInputType) => void;
  onChange?: (value: string) => void;
};

const SmartInputField = (
  {
    value,
    onChange,
    type = 'text',
    currentType = SignInIdentifier.Username,
    enabledTypes = [currentType],
    onTypeChange,
    ...rest
  }: Props,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const { countryCode, onCountryCodeChange, inputValue, onInputValueChange, onInputValueClear } =
    useSmartInputField({
      onChange,
      enabledTypes,
      currentType,
      onTypeChange,
    });

  const isPhoneEnabled = enabledTypes.includes(SignInIdentifier.Phone);

  return (
    <InputField
      {...rest}
      ref={ref}
      isSuffixFocusVisible
      isPrefixVisible={isPhoneEnabled && currentType === SignInIdentifier.Phone}
      type={type}
      value={inputValue}
      prefix={conditional(
        isPhoneEnabled && (
          <AnimatedPrefix isVisible={currentType === SignInIdentifier.Phone}>
            <CountryCodeSelector value={countryCode} onChange={onCountryCodeChange} />
          </AnimatedPrefix>
        )
      )}
      suffix={
        <IconButton onClick={onInputValueClear}>
          <ClearIcon />
        </IconButton>
      }
      onChange={onInputValueChange}
    />
  );
};

export default forwardRef(SmartInputField);
