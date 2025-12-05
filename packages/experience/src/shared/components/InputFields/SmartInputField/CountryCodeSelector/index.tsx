import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import getCountryFlag from 'country-flag-icons/unicode';
import type { ForwardedRef } from 'react';
import { useState, useMemo, forwardRef } from 'react';

import DownArrowIcon from '@/assets/icons/arrow-down.svg?react';
import { onKeyDownHandler } from '@/shared/utils/a11y';
import {
  getCountryList,
  getDefaultCountryCallingCode,
  getDefaultCountryCode,
} from '@/utils/country-code';

import CountryCodeDropdown from './CountryCodeDropdown';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly value?: string;
  readonly inputRef?: Nullable<HTMLInputElement>;
  readonly isVisible?: boolean;
  readonly isInteractive?: boolean;
  readonly onChange?: (value: string) => void;
};

const CountryCodeSelector = (
  { className, value, inputRef, isVisible = true, isInteractive = true, onChange }: Props,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const countryList = useMemo(getCountryList, []);
  const defaultCountryCallingCode = useMemo(getDefaultCountryCallingCode, []);
  const defaultCountryCode = useMemo(getDefaultCountryCode, []);

  const showDropDown = () => {
    setIsDropdownOpen(true);
  };

  const hideDropDown = () => {
    setIsDropdownOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const countryCallingCode = value || defaultCountryCallingCode;
  const country = countryList.find((item) => item.countryCallingCode === countryCallingCode);
  const countryCode = country?.countryCode ?? defaultCountryCode;

  return (
    <div
      ref={ref}
      className={classNames(styles.countryCodeSelector, isVisible && styles.visible, className)}
      role="button"
      tabIndex={isVisible && isInteractive ? 0 : -1}
      aria-disabled={!isInteractive}
      style={isInteractive ? undefined : { pointerEvents: 'none' }}
      onClick={isInteractive ? showDropDown : undefined}
      onKeyDown={
        isInteractive
          ? onKeyDownHandler({
              Enter: showDropDown,
            })
          : undefined
      }
    >
      <span className={styles.countryIcon}>{getCountryFlag(countryCode)}</span>
      <span>{`+${countryCallingCode}`}</span>
      <DownArrowIcon />
      <CountryCodeDropdown
        inputRef={inputRef}
        isOpen={isDropdownOpen}
        countryCode={countryCallingCode}
        countryList={countryList}
        onClose={hideDropDown}
        onChange={onChange}
      />
    </div>
  );
};

export default forwardRef(CountryCodeSelector);
