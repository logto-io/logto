import type { Nullable } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CheckMark from '@/assets/icons/check-mark.svg';
import SearchIcon from '@/assets/icons/search-icon.svg';
import InputField from '@/components/InputFields/InputField';
import NavBar from '@/components/NavBar';
import useDebounce from '@/hooks/use-debounce';
import usePlatform from '@/hooks/use-platform';
import { onKeyDownHandler } from '@/utils/a11y';
import type { CountryMetaData } from '@/utils/country-code';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  countryCode: string;
  countryList: CountryMetaData[];
  inputRef?: Nullable<HTMLInputElement>;
  onClose: () => void;
  onChange?: (value: string) => void;
};

const CountryCodeDropdown = ({
  isOpen,
  countryCode,
  countryList,
  inputRef,
  onClose,
  onChange,
}: Props) => {
  const { isMobile } = usePlatform();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [position, setPosition] = useState({});
  const debouncedSearchValue = useDebounce(searchValue, 100);

  const onSearchChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(target.value);
  }, []);

  const onDestroy = useCallback(() => {
    setSearchValue('');
    onClose();
  }, [onClose]);

  const onCodeChange = useCallback(
    (value: string) => {
      onChange?.(value);
      onDestroy();
    },
    [onChange, onDestroy]
  );

  const updatePosition = useCallback(() => {
    const parent = inputRef?.parentElement;
    const offset = 8;

    if (!isMobile && parent) {
      const { top, left, height, width } = parent.getBoundingClientRect();

      setPosition({ top: top + height + offset, left, width });

      return;
    }

    setPosition({});
  }, [inputRef?.parentElement, isMobile]);

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  const filteredCountryList = useMemo(
    () =>
      countryList.filter(({ countryCallingCode }) => {
        const searchValue = debouncedSearchValue.startsWith('+')
          ? debouncedSearchValue.slice(1)
          : debouncedSearchValue;

        return countryCallingCode.startsWith(searchValue);
      }),
    [countryList, debouncedSearchValue]
  );

  return (
    <ReactModal
      id="country-code-dropdown"
      isOpen={isOpen}
      overlayClassName={styles.dropdownOverlay}
      className={styles.dropdownModal}
      style={{
        content: {
          ...position,
        },
      }}
      closeTimeoutMS={200}
      onRequestClose={(event) => {
        event.stopPropagation();
        onDestroy();
      }}
    >
      <div
        className={styles.dropdownContent}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          // Prevent parent node trigger onClick show modal event
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          // Prevent parent node trigger onClick show modal event
          event.stopPropagation();
        }}
      >
        {isMobile && (
          <NavBar type="back" title={t('input.search_region_code')} onClose={onDestroy} />
        )}
        <InputField
          autoFocus
          name="country-code-search"
          type="number"
          prefix={<SearchIcon />}
          value={searchValue}
          className={styles.searchInputField}
          placeholder={t('input.search_region_code')}
          onChange={onSearchChange}
        />
        <ul className={styles.countryList}>
          {filteredCountryList.map(({ countryCallingCode, countryCode: countryKeyCode }) => {
            const isActive = countryCallingCode === countryCode;

            return (
              <li
                key={countryKeyCode}
                tabIndex={0}
                className={conditional(isActive && styles.active)}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                role="button"
                onKeyDown={onKeyDownHandler({
                  Enter: () => {
                    onCodeChange(countryCallingCode);
                  },
                })}
                onClick={() => {
                  onCodeChange(countryCallingCode);
                }}
              >
                {isActive && <CheckMark />}
                {`+${countryCallingCode}`}
              </li>
            );
          })}
        </ul>
      </div>
    </ReactModal>
  );
};

export default CountryCodeDropdown;
