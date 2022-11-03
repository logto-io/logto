import classNames from 'classnames';
import { useState, useMemo, useRef } from 'react';

import DownArrowIcon from '@/assets/icons/arrow-down.svg';
import ClearIcon from '@/assets/icons/clear-icon.svg';
import type { ErrorType } from '@/components/ErrorMessage';
import ErrorMessage from '@/components/ErrorMessage';
import type { CountryCallingCode, CountryMetaData } from '@/hooks/use-phone-number';

import * as styles from './index.module.scss';
import * as phoneInputStyles from './phoneInput.module.scss';

type Value = { countryCallingCode?: CountryCallingCode; nationalNumber?: string };

export type Props = {
  name: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
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
  autoFocus,
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
    if (countryCallingCode === undefined || !countryList?.length) {
      return null;
    }

    return (
      <div className={phoneInputStyles.countryCodeSelector}>
        <span>{`+${countryCallingCode}`}</span>
        <DownArrowIcon />
        <select
          autoComplete="tel-country-code"
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
          {countryList.map(({ countryCallingCode, countryCode }) => (
            <option key={countryCode} value={countryCallingCode}>
              {`+${countryCallingCode}`}
            </option>
          ))}
        </select>
      </div>
    );
  }, [countryCallingCode, countryList, onChange]);

  return (
    <div className={className}>
      <div className={classNames(styles.wrapper, error && styles.error)}>
        {countrySelector}
        <input
          ref={inputReference}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          name={name}
          placeholder={placeholder}
          value={nationalNumber}
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
