import classNames from 'classnames';
import { HTMLProps } from 'react';

import ClearIcon from '@/assets/icons/clear-icon.svg';
import ErrorMessage, { ErrorType } from '@/components/ErrorMessage';

import * as styles from './index.module.scss';

export { default as PasswordInput } from './PasswordInput';
export { default as PhoneInput } from './PhoneInput';

export type Props = HTMLProps<HTMLInputElement> & {
  className?: string;
  error?: ErrorType;
  onClear?: () => void;
  errorStyling?: boolean;
};

const Input = ({
  className,
  type = 'text',
  value,
  error,
  errorStyling = true,
  onClear,
  ...rest
}: Props) => {
  return (
    <div className={className}>
      <div className={classNames(styles.wrapper, error && errorStyling && styles.error)}>
        <input type={type} value={value} {...rest} />
        {value && onClear && (
          <ClearIcon
            className={styles.actionButton}
            onMouseDown={(event) => {
              event.preventDefault();
              onClear();
            }}
          />
        )}
      </div>
      {error && <ErrorMessage error={error} className={styles.errorMessage} />}
    </div>
  );
};

export default Input;
