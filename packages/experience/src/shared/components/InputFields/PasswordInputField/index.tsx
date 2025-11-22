import type { Nullable } from '@silverhand/essentials';
import type { Ref } from 'react';
import { forwardRef, useRef, useImperativeHandle, useState } from 'react';

import PasswordHideIcon from '@/shared/assets/icons/password-hide-icon.svg?react';
import PasswordShowIcon from '@/shared/assets/icons/password-show-icon.svg?react';
import IconButton from '@/shared/components/IconButton';

import InputField from '../InputField';
import type { Props as InputFieldProps } from '../InputField';

type Props = Omit<InputFieldProps, 'type' | 'suffix' | 'isSuffixFocusVisible'>;

const PasswordInputField = (props: Props, forwardRef: Ref<Nullable<HTMLInputElement>>) => {
  const [showPassword, setShowPassword] = useState(false);
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
            setShowPassword((previous) => !previous);
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
