import { languages, LanguageTag } from '@logto/language-kit';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import * as style from './LanguageItem.module.scss';

type Props = {
  languageTag: LanguageTag;
  isSelected: boolean;
  onClick: () => void;
};

const LanguageItem = ({ languageTag, isSelected, onClick }: Props) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected) {
      itemRef.current?.scrollIntoView(false);
    }
  }, [isSelected]);

  return (
    <div
      ref={itemRef}
      className={classNames(style.languageItem, isSelected && style.selected)}
      onClick={() => {
        if (isSelected) {
          return;
        }
        onClick();
      }}
    >
      <div className={style.languageName}>{languages[languageTag]}</div>
      <div className={style.languageTag}>{languageTag}</div>
    </div>
  );
};

export default LanguageItem;
