import { LanguageTag, languages as uiLanguageNameMapping } from '@logto/language-kit';
import classNames from 'classnames';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/images/plus.svg';
import SearchIcon from '@/assets/images/search.svg';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';

import * as style from './AddLanguageSelector.module.scss';

type Props = {
  options: LanguageTag[];
  onSelect: (languageTag: LanguageTag) => void;
};

const AddLanguageSelector = ({ options, onSelect }: Props) => {
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

  return (
    <div ref={selectorRef} className={style.languageSelector}>
      <div className={style.input}>
        <Button
          className={classNames(style.addLanguageButton, isDropDownOpen && style.hidden)}
          icon={<Plus className={style.buttonIcon} />}
          title="sign_in_exp.others.manage_language.add_language"
          type="outline"
          size="medium"
          onClick={() => {
            setIsDropDownOpen(true);
          }}
        />
        <TextInput
          ref={searchInputRef}
          icon={<SearchIcon className={style.buttonIcon} />}
          className={classNames(!isDropDownOpen && style.hidden)}
          placeholder={t('general.type_to_search')}
          value={searchInputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setSearchInputValue(event.target.value);
          }}
        />
      </div>
      {isDropDownOpen && filteredOptions.length > 0 && (
        <ul className={style.dropDown}>
          {filteredOptions.map((languageTag) => (
            // TODO: @yijun
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <li
              key={languageTag}
              className={style.dropDownItem}
              onClick={() => {
                onSelect(languageTag);
                setIsDropDownOpen(false);
                setSearchInputValue('');
              }}
            >
              <div className={style.languageName}>{uiLanguageNameMapping[languageTag]}</div>
              <div className={style.languageTag}>{languageTag}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddLanguageSelector;
