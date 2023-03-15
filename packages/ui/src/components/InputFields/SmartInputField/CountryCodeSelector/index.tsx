import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ForwardedRef } from 'react';
import { useState, useMemo, forwardRef } from 'react';

import DownArrowIcon from '@/assets/icons/arrow-down.svg';
import { onKeyDownHandler } from '@/utils/a11y';
import { getCountryList, getDefaultCountryCallingCode } from '@/utils/country-code';

import CountryCodeDropdown from './CountryCodeDropdown';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  value?: string;
  inputRef?: Nullable<HTMLInputElement>;
  onChange?: (value: string) => void;
};

const CountryCodeSelector = (
  { className, value, inputRef, onChange }: Props,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const countryList = useMemo(getCountryList, []);
  const defaultCountCode = useMemo(getDefaultCountryCallingCode, []);

  const showDropDown = () => {
    setIsDropdownOpen(true);
  };

  const hideDropDown = () => {
    setIsDropdownOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const countryCode = value || defaultCountCode;

  return (
    <div
      ref={ref}
      className={classNames(styles.countryCodeSelector, className)}
      role="button"
      tabIndex={0}
      onClick={showDropDown}
      onKeyDown={onKeyDownHandler({
        Enter: showDropDown,
      })}
    >
      <span>{`+${countryCode}`}</span>
      <DownArrowIcon />
      <CountryCodeDropdown
        inputRef={inputRef}
        isOpen={isDropdownOpen}
        countryCode={countryCode}
        countryList={countryList}
        onClose={hideDropDown}
        onChange={onChange}
      />
    </div>
  );
};

export default forwardRef(CountryCodeSelector);
