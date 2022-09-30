import { languages, LanguageTag } from '@logto/language-kit';
import { useRef, useState } from 'react';

import Button from '@/components/Button';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import Plus from '@/icons/Plus';

import * as style from './AddLanguageSelector.module.scss';

type Props = {
  options: LanguageTag[];
  onSelect: (languageTag: LanguageTag) => void;
};

// TODO:(LOG-4147) Support Instant Search In Manage Language Editor Dropdown
const AddLanguageSelector = ({ options, onSelect }: Props) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  return (
    <div>
      <div ref={anchorRef}>
        <Button
          className={style.addLanguageButton}
          icon={<Plus className={style.iconPlus} />}
          title="sign_in_exp.others.manage_language.add_language"
          type="outline"
          size="medium"
          onClick={() => {
            setIsDropDownOpen(true);
          }}
        />
      </div>
      <Dropdown
        isFullWidth
        anchorRef={anchorRef}
        isOpen={isDropDownOpen}
        onClose={() => {
          setIsDropDownOpen(false);
        }}
      >
        {options.map((languageTag) => (
          <DropdownItem
            key={languageTag}
            onClick={() => {
              onSelect(languageTag);
            }}
          >
            <div className={style.dropDownItem}>
              <div className={style.languageName}>{languages[languageTag]}</div>
              <div className={style.languageTag}>{languageTag}</div>
            </div>
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
};

export default AddLanguageSelector;
