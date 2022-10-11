import {
  isLanguageTag,
  LanguageTag,
  languages as uiLanguageNameMapping,
} from '@logto/language-kit';
import { useContext } from 'react';

import AddLanguageSelector from './AddLanguageSelector';
import LanguageItem from './LanguageItem';
import * as style from './LanguageNav.module.scss';
import { LanguageEditorContext } from './use-language-editor-context';

const LanguageNav = () => {
  const {
    languages,
    selectedLanguage,
    isAddingLanguage,
    isDirty,
    setConfirmationState,
    setSelectedLanguage,
    setPreSelectedLanguage,
    setPreAddedLanguage,
    startAddingLanguage,
  } = useContext(LanguageEditorContext);

  const languageOptions = Object.keys(uiLanguageNameMapping).filter(
    (languageTag): languageTag is LanguageTag =>
      isLanguageTag(languageTag) && !languages.includes(languageTag)
  );

  const onAddLanguage = (languageTag: LanguageTag) => {
    if (isDirty || isAddingLanguage) {
      setPreAddedLanguage(languageTag);
      setConfirmationState('try-add-language');

      return;
    }

    startAddingLanguage(languageTag);
  };

  const onSwitchLanguage = (languageTag: LanguageTag) => {
    if (isDirty || isAddingLanguage) {
      setPreSelectedLanguage(languageTag);
      setConfirmationState('try-switch-language');

      return;
    }

    setSelectedLanguage(languageTag);
  };

  return (
    <div className={style.languageNav}>
      <AddLanguageSelector options={languageOptions} onSelect={onAddLanguage} />
      <div className={style.languageItemList}>
        {languages.map((languageTag) => (
          <LanguageItem
            key={languageTag}
            languageTag={languageTag}
            isSelected={selectedLanguage === languageTag}
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
