import classNames from 'classnames';
import React, { useState, useMemo, useRef } from 'react';

import { CountryCallingCode, CountryMetaData } from '@/hooks/use-phone-number';

import { ClearIcon, DownArrowIcon } from '../Icons';
import * as styles from './index.module.scss';
import * as phoneInputStyles from './phoneInput.module.scss';

export type Props = {
  name: string;
  autoComplete?: AutoCompleteType;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
  countryCallingCode?: CountryCallingCode;
  nationalNumber: string;
  countryList?: CountryMetaData[];
  hasError?: boolean;
  onChange: (value: { countryCallingCode?: CountryCallingCode; nationalNumber?: string }) => void;
};

const PhoneInput = ({
  name,
  autoComplete,
  isDisabled,
  className,
  placeholder,
  countryCallingCode,
  nationalNumber,
  countryList,
  hasError = false,
  onChange,
}: Props) => {
  const [onFocus, setOnFocus] = useState(false);
  const inputReference = useRef<HTMLInputElement>(null);

  const countrySelector = useMemo(() => {
    if (!countryCallingCode || !countryList) {
      return null;
    }

    return (
      <div className={phoneInputStyles.countryCodeSelector}>
        <span>{`+${countryCallingCode}`}</span>
        <DownArrowIcon />
        <select
          onChange={({ target: { value } }) => {
            onChange({ countryCallingCode: value });

            // Auto Focus to the input
            if (inputReference.current) {
              inputReference.current.focus();
              const { length } = inputReference.current.value;
              inputReference.current.setSelectionRange(length, length);
            }
          }}
        >
          {countryList.map(({ countryCode, countryCallingCode, countryName }) => (
            <option key={countryCode} value={countryCallingCode}>
              {`${countryName ?? countryCode}: +${countryCallingCode}`}
            </option>
          ))}
        </select>
      </div>
    );
  }, [countryCallingCode, countryList, onChange]);

  return (
    <div
      className={classNames(
        styles.wrapper,
        onFocus && styles.focus,
        hasError && styles.error,
        className
      )}
    >
      {countrySelector}
      <input
        ref={inputReference}
        name={name}
        disabled={isDisabled}
        placeholder={placeholder}
        value={nationalNumber}
        type="tel"
        autoComplete={autoComplete}
        onFocus={() => {
          setOnFocus(true);
        }}
        onBlur={() => {
          setOnFocus(false);
        }}
        onChange={({ target: { value } }) => {
          onChange({ nationalNumber: value });
        }}
      />
      {nationalNumber && onFocus && (
        <ClearIcon
          className={styles.actionButton}
          onMouseDown={(event) => {
            event.preventDefault();
            onChange({ nationalNumber: '' });
          }}
        />
      )}
    </div>
  );
};

export default PhoneInput;
