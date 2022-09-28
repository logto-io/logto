import { LanguageTag } from '@logto/language-kit';

import Button from '@/components/Button';
import Plus from '@/icons/Plus';

import LanguageItem from './LanguageItem';
import * as style from './LanguageNav.module.scss';

type Props = {
  languageTags: LanguageTag[];
  selectedLanguageTag: LanguageTag;
  onSelect: (languageTag: LanguageTag) => void;
};

const LanguageNav = ({ languageTags, selectedLanguageTag, onSelect }: Props) => {
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
        {languageTags.map((languageTag) => (
          <LanguageItem
            key={languageTag}
            languageTag={languageTag}
            isSelected={selectedLanguageTag === languageTag}
            onClick={() => {
              onSelect(languageTag);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LanguageNav;
