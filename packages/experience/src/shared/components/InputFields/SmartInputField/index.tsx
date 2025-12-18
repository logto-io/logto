import { SignInIdentifier } from '@logto/schemas';
import { animated, config, useSpring } from '@react-spring/web';
import type { Nullable } from '@silverhand/essentials';
import type { HTMLProps, Ref } from 'react';
import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

import ClearIcon from '@/shared/assets/icons/clear-icon.svg?react';
import IconButton from '@/shared/components/IconButton';
import InputField from '@/shared/components/InputFields/InputField';

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
  const isInputEditable = !rest.readOnly && !rest.disabled;

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
      isSuffixFocusVisible={isInputEditable && Boolean(inputValue)}
      style={{ paddingInlineStart }}
      value={inputValue}
      isPrefixVisible={isPrefixVisible}
      prefix={
        <AnimatedPrefix isVisible={isPrefixVisible}>
          <CountryCodeSelector
            value={countryCode}
            inputRef={innerRef}
            isInteractive={isInputEditable}
            onChange={(value) => {
              onCountryCodeChange(value);

              // Focus the input field after the animation is complete
              // because the animation will cause the input field to lose focus
              setTimeout(() => {
                innerRef.current?.focus();
              }, 300);
            }}
          />
        </AnimatedPrefix>
      }
      suffix={
        isInputEditable ? (
          <IconButton
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={onInputValueClear}
          >
            <ClearIcon />
          </IconButton>
        ) : undefined
      }
      onChange={isInputEditable ? onInputValueChange : undefined}
    />
  );
};

export default forwardRef(SmartInputField);
