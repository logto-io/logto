import { SignInIdentifier } from '@logto/schemas';
import { animated, config, useSpring } from '@react-spring/web';
import type { Nullable } from '@silverhand/essentials';
import type { HTMLProps, Ref } from 'react';
import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

import ClearIcon from '@/assets/icons/clear-icon.svg?react';
import IconButton from '@/components/Button/IconButton';

import InputField from '../InputField';

import AnimatedPrefix from './AnimatedPrefix';
import CountryCodeSelector from './CountryCodeSelector';
import type { IdentifierInputType, IdentifierInputValue } from './use-smart-input-field';
import useSmartInputField from './use-smart-input-field';
import { getInputHtmlProps } from './utils';

export type { IdentifierInputType, IdentifierInputValue } from './use-smart-input-field';

type Props = Omit<HTMLProps<HTMLInputElement>, 'onChange' | 'prefix' | 'value'> & {
  readonly className?: string;
  readonly errorMessage?: string;
  readonly isDanger?: boolean;

  readonly enabledTypes?: IdentifierInputType[];

  readonly defaultValue?: string;
  readonly onChange?: (data: IdentifierInputValue) => void;
};

const AnimatedInputField = animated(InputField);

const SmartInputField = (
  { defaultValue, enabledTypes = [], onChange, ...rest }: Props,
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
    defaultValue,
    enabledTypes,
  });

  const isPrefixVisible = identifierType === SignInIdentifier.Phone;
  const { paddingInlineStart } = useSpring({
    paddingInlineStart: isPrefixVisible ? 4 : 16,
    config: { ...config.default, clamp: true },
  });

  useEffect(() => {
    onChange?.({
      type: identifierType,
      value: isPrefixVisible && inputValue ? `${countryCode}${inputValue}` : inputValue,
    });
  }, [countryCode, identifierType, inputValue, isPrefixVisible, onChange]);

  return (
    <AnimatedInputField
      {...getInputHtmlProps(enabledTypes, identifierType)}
      {...rest}
      ref={innerRef}
      isSuffixFocusVisible={Boolean(inputValue)}
      style={{ paddingInlineStart }}
      value={inputValue}
      isPrefixVisible={isPrefixVisible}
      prefix={
        <AnimatedPrefix isVisible={isPrefixVisible}>
          <CountryCodeSelector
            value={countryCode}
            inputRef={innerRef.current}
            onChange={(value) => {
              onCountryCodeChange(value);
              innerRef.current?.focus();
            }}
          />
        </AnimatedPrefix>
      }
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
