import classNames from 'classnames';
import React, { useState, useMemo, useRef } from 'react';

import ErrorMessage, { ErrorType } from '@/components/ErrorMessage';
import { ClearIcon, DownArrowIcon } from '@/components/Icons';
import { CountryCallingCode, CountryMetaData } from '@/hooks/use-phone-number';

import * as styles from './index.module.scss';
import * as phoneInputStyles from './phoneInput.module.scss';

type Value = { countryCallingCode?: CountryCallingCode; nationalNumber?: string };

export type Props = {
  name: string;
  autoComplete?: AutoCompleteType;
  className?: string;
  placeholder?: string;
  countryCallingCode?: CountryCallingCode;
  nationalNumber: string;
  countryList?: CountryMetaData[];
  error?: ErrorType;
  onChange: (value: Value) => void;
};

const PhoneInput = ({
  name,
  autoComplete,
  className,
  placeholder,
  countryCallingCode,
  nationalNumber,
  countryList,
  error,
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
    <div className={className}>
      <div className={classNames(styles.wrapper, onFocus && styles.focus, error && styles.error)}>
        {countrySelector}
        <input
          ref={inputReference}
          name={name}
          placeholder={placeholder}
          value={nationalNumber}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          onFocus={() => {
            setOnFocus(true);
          }}
          onBlur={() => {
            setOnFocus(false);
          }}
          onChange={({ target: { value } }) => {
            onChange({ nationalNumber: value.replaceAll(/\D/g, '') });
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
      {error && <ErrorMessage error={error} className={styles.errorMessage} />}
    </div>
  );
};

export default PhoneInput;
