import classNames from 'classnames';
import type { ForwardedRef } from 'react';
import { useState, useMemo, forwardRef } from 'react';

import DownArrowIcon from '@/assets/icons/arrow-down.svg?react';
import { onKeyDownHandler } from '@/shared/utils/a11y';
import { getCountryList, getDefaultCountryCallingCode } from '@/utils/country-code';

import CountryCodeDropdown from './CountryCodeDropdown';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly value?: string;
  readonly inputRef?: React.RefObject<HTMLInputElement | undefined>;
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
