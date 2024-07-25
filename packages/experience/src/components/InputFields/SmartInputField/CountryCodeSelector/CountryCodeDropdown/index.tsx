import type { Nullable } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { KeyboardEventHandler } from 'react';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CheckMark from '@/assets/icons/check-mark.svg?react';
import SearchIcon from '@/assets/icons/search-icon.svg?react';
import InputField from '@/components/InputFields/InputField';
import NavBar from '@/components/NavBar';
import useDebounce from '@/hooks/use-debounce';
import usePlatform from '@/hooks/use-platform';
import { onKeyDownHandler } from '@/utils/a11y';
import type { CountryMetaData } from '@/utils/country-code';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly countryCode: string;
  readonly countryList: CountryMetaData[];
  readonly inputRef?: Nullable<HTMLInputElement>;
  readonly onClose: () => void;
  readonly onChange?: (value: string) => void;
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
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
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

  useLayoutEffect(() => {
    if (!debouncedSearchValue) {
      setSelectedCountryCode('');

      return;
    }

    // Auto Focus on the first available element
    const firstCountryCode = filteredCountryList[0]?.countryCallingCode;
    setSelectedCountryCode(firstCountryCode ?? '');
  }, [filteredCountryList, debouncedSearchValue]);

  const onInputKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      const { key } = event;

      switch (key) {
        case 'Enter':
        case ' ': {
          event.preventDefault();
          event.stopPropagation();

          if (selectedCountryCode) {
            onCodeChange(selectedCountryCode);
          }
          break;
        }
        case 'Escape': {
          event.preventDefault();
          event.stopPropagation();
          onDestroy();
          break;
        }
        case 'ArrowUp':
        case 'ArrowLeft': {
          event.preventDefault();
          event.stopPropagation();

          const currentSelectedIndex = filteredCountryList.findIndex(
            ({ countryCallingCode }) => countryCallingCode === selectedCountryCode
          );

          if (currentSelectedIndex <= 0) {
            return;
          }

          const nextSelectedCountryCode = filteredCountryList[currentSelectedIndex - 1];

          setSelectedCountryCode(nextSelectedCountryCode?.countryCallingCode ?? '');
          break;
        }
        case '-':
        case 'e':
        case '.': {
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        case 'ArrowRight':
        case 'ArrowDown': {
          event.preventDefault();
          event.stopPropagation();

          const currentSelectedIndex = filteredCountryList.findIndex(
            ({ countryCallingCode }) => countryCallingCode === selectedCountryCode
          );

          if (currentSelectedIndex >= filteredCountryList.length - 1) {
            return;
          }

          const nextSelectedCountryCode = filteredCountryList[currentSelectedIndex + 1];
          setSelectedCountryCode(nextSelectedCountryCode?.countryCallingCode ?? '');
          break;
        }
        default: {
          break;
        }
      }
    },
    [filteredCountryList, onCodeChange, onDestroy, selectedCountryCode]
  );

  useLayoutEffect(() => {
    const selectedItemDom = document.querySelector(`li[data-id="${selectedCountryCode}"]`);

    if (selectedItemDom) {
      selectedItemDom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedCountryCode]);

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
          min={0}
          prefix={<SearchIcon />}
          value={searchValue}
          className={styles.searchInputField}
          inputFieldClassName={styles.innerInputFiled}
          placeholder={t('input.search_region_code')}
          onChange={onSearchChange}
          onKeyDown={onInputKeyDown}
        />
        <ul className={styles.countryList}>
          {filteredCountryList.map(({ countryCallingCode, countryCode: countryKeyCode }) => {
            const isActive = countryCallingCode === countryCode;
            const isSelected = countryCallingCode === selectedCountryCode;

            return (
              <li
                key={countryKeyCode}
                tabIndex={0}
                data-id={countryCallingCode}
                className={classNames(
                  conditional(isActive && styles.active),
                  conditional(isSelected && styles.selected)
                )}
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
                onMouseEnter={() => {
                  setSelectedCountryCode(countryCallingCode);
                }}
                onMouseLeave={() => {
                  setSelectedCountryCode('');
                }}
              >
                {isActive && <CheckMark />}
                {`+${countryCallingCode}`}
              </li>
            );
          })}
        </ul>
        {filteredCountryList.length === 0 && (
          <div className={styles.notFound}>{t('description.no_region_code_found')}</div>
        )}
      </div>
    </ReactModal>
  );
};

export default CountryCodeDropdown;
