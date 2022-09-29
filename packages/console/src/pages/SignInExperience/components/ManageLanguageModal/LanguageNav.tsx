import { isLanguageTag, languages, LanguageTag } from '@logto/language-kit';
import { useContext } from 'react';

import { CustomPhrasesContext } from '../../hooks/use-custom-phrases-context';
import AddLanguageSelector from './AddLanguageSelector';
import LanguageItem from './LanguageItem';
import * as style from './LanguageNav.module.scss';

const LanguageNav = () => {
  const {
    displayingLanguages,
    selectedLanguageTag,
    isAddingLanguage,
    isCurrentCustomPhraseDirty,
    setConfirmationState,
    setSelectedLanguageTag,
    setPreSelectedLanguageTag,
    setPreAddedLanguageTag,
    startAddingLanguage,
  } = useContext(CustomPhrasesContext);

  const languageOptions = Object.keys(languages).filter(
    (languageTag): languageTag is LanguageTag =>
      isLanguageTag(languageTag) && !displayingLanguages.includes(languageTag)
  );

  const onAddLanguage = (languageTag: LanguageTag) => {
    if (isCurrentCustomPhraseDirty || isAddingLanguage) {
      setPreAddedLanguageTag(languageTag);
      setConfirmationState('try-add-language');

      return;
    }

    startAddingLanguage(languageTag);
  };

  const onSwitchLanguage = (languageTag: LanguageTag) => {
    if (isCurrentCustomPhraseDirty || isAddingLanguage) {
      setPreSelectedLanguageTag(languageTag);
      setConfirmationState('try-switch-language');

      return;
    }

    setSelectedLanguageTag(languageTag);
  };

  return (
    <div className={style.languageNav}>
      <AddLanguageSelector options={languageOptions} onSelect={onAddLanguage} />
      <div className={style.languageItemList}>
        {displayingLanguages.map((languageTag) => (
          <LanguageItem
            key={languageTag}
            languageTag={languageTag}
            isSelected={selectedLanguageTag === languageTag}
            onClick={() => {
              onSwitchLanguage(languageTag);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LanguageNav;
