import type { LanguageTag } from '@logto/language-kit';
import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg?react';
import SearchIcon from '@/assets/icons/search.svg?react';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import { onKeyDownHandler } from '@/utils/a11y';

import style from './AddLanguageSelector.module.scss';

type Props = {
  readonly options: LanguageTag[];
  readonly onSelect: (languageTag: LanguageTag) => void;
};

function AddLanguageSelector({ options, onSelect }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const selectorRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  const filteredOptions = searchInputValue
    ? options.filter(
        (languageTag) =>
          languageTag.toLocaleLowerCase().includes(searchInputValue.toLocaleLowerCase()) ||
          uiLanguageNameMapping[languageTag]
            .toLocaleLowerCase()
            .includes(searchInputValue.toLocaleLowerCase())
      )
    : options;

  const clickOutsideHandler = ({ target }: MouseEvent) => {
    if (target instanceof HTMLElement && !selectorRef.current?.contains(target)) {
      setIsDropDownOpen(false);
      setSearchInputValue('');
    }
  };

  useEffect(() => {
    if (isDropDownOpen) {
      searchInputRef.current?.focus();
      document.addEventListener('mousedown', clickOutsideHandler);
    } else {
      document.removeEventListener('mousedown', clickOutsideHandler);
    }

    return () => {
      if (isDropDownOpen) {
        document.removeEventListener('mousedown', clickOutsideHandler);
      }
    };
  }, [isDropDownOpen, searchInputRef]);

  const handleSelect = (languageTag: LanguageTag) => {
    onSelect(languageTag);
    setIsDropDownOpen(false);
    setSearchInputValue('');
  };

  return (
    <div ref={selectorRef} className={style.languageSelector}>
      <div className={style.input}>
        {isDropDownOpen ? (
          <TextInput
            ref={searchInputRef}
            icon={<SearchIcon className={style.buttonIcon} />}
            placeholder={t('general.type_to_search')}
            value={searchInputValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSearchInputValue(event.target.value);
            }}
          />
        ) : (
          <Button
            className={style.addLanguageButton}
            icon={<Plus className={style.buttonIcon} />}
            title="sign_in_exp.content.manage_language.add_language"
            type="default"
            size="medium"
            onClick={() => {
              setIsDropDownOpen(true);
            }}
          />
        )}
      </div>
      {isDropDownOpen && (
        <OverlayScrollbar className={style.dropDown}>
          {filteredOptions.length === 0 ? (
            <div className={style.noDataPlaceholder}>
              <DynamicT forKey="errors.empty" />
            </div>
          ) : (
            filteredOptions.map((languageTag) => (
              <div
                key={languageTag}
                role="tab"
                tabIndex={0}
                className={style.dropDownItem}
                onKeyDown={onKeyDownHandler(() => {
                  handleSelect(languageTag);
                })}
                onClick={() => {
                  handleSelect(languageTag);
                }}
              >
                <div className={style.languageName}>{uiLanguageNameMapping[languageTag]}</div>
                <div className={style.languageTag}>{languageTag}</div>
              </div>
            ))
          )}
        </OverlayScrollbar>
      )}
    </div>
  );
}

export default AddLanguageSelector;
