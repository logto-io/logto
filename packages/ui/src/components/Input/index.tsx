import classNames from 'classnames';
import React from 'react';
import styles from './index.module.scss';

export type Props = {
  className?: string;
  placeholder?: string;
  type?: InputType;
  value: string;
  onChange: (value: string) => void;
};

const Input = ({ className, placeholder, type = 'text', value, onChange }: Props) => {
  return (
    <input
      className={classNames(styles.input, className)}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={({ target: { value } }) => {
        onChange(value);
      }}
    />
  );
};

export default Input;
