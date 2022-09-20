import { LanguageKey } from '@logto/core-kit';

import Button from '@/components/Button';
import Plus from '@/icons/Plus';

import LanguageItem from './LanguageItem';
import * as style from './LanguageNav.module.scss';

type Props = {
  languageKeys: LanguageKey[];
  selectedLanguage: LanguageKey;
  onSelect: (languageKey: LanguageKey) => void;
};

const LanguageNav = ({ languageKeys, selectedLanguage, onSelect }: Props) => {
  // TODO: LOG-4146 Add Custom Language
  return (
    <div className={style.languageNav}>
      <Button
        className={style.addLanguageButton}
        icon={<Plus className={style.iconPlus} />}
        title="sign_in_exp.others.manage_language.add_language"
        type="outline"
        size="medium"
      />
      <div>
        {languageKeys.map((key) => (
          <LanguageItem
            key={key}
            languageKey={key}
            isSelected={selectedLanguage === key}
            onClick={() => {
              onSelect(key);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LanguageNav;
