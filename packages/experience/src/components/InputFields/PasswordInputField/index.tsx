import type { Nullable } from '@silverhand/essentials';
import type { Ref } from 'react';
import { forwardRef, useRef, useImperativeHandle } from 'react';

import PasswordHideIcon from '@/assets/icons/password-hide-icon.svg?react';
import PasswordShowIcon from '@/assets/icons/password-show-icon.svg?react';
import IconButton from '@/components/Button/IconButton';
import useToggle from '@/hooks/use-toggle';

import InputField from '../InputField';
import type { Props as InputFieldProps } from '../InputField';

type Props = Omit<InputFieldProps, 'type' | 'suffix' | 'isSuffixFocusVisible'>;

const PasswordInputField = (props: Props, forwardRef: Ref<Nullable<HTMLInputElement>>) => {
  const [showPassword, toggleShowPassword] = useToggle(false);
  const innerRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(forwardRef, () => innerRef.current);

  return (
    <InputField
      isSuffixFocusVisible
      type={showPassword ? 'text' : 'password'}
      suffix={
        <IconButton
          onMouseDown={(event) => {
            event.preventDefault();
            toggleShowPassword();
          }}
        >
          {showPassword ? <PasswordShowIcon /> : <PasswordHideIcon />}
        </IconButton>
      }
      {...props}
      ref={innerRef}
    />
  );
};

export default forwardRef(PasswordInputField);
