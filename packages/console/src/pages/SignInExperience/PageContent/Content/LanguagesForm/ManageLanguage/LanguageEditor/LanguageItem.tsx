import type { LanguageTag } from '@logto/language-kit';
import { languages } from '@logto/language-kit';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import { onKeyDownHandler } from '@/utils/a11y';

import style from './LanguageItem.module.scss';

type Props = {
  readonly languageTag: LanguageTag;
  readonly isSelected: boolean;
  readonly onClick: () => void;
};

function LanguageItem({ languageTag, isSelected, onClick }: Props) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected) {
      itemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  const handleSelect = () => {
    if (isSelected) {
      return;
    }
    onClick();
  };

  return (
    <div
      ref={itemRef}
      role="tab"
      tabIndex={0}
      aria-selected={isSelected}
      className={classNames(style.languageItem, isSelected && style.selected)}
      onClick={handleSelect}
      onKeyDown={onKeyDownHandler(handleSelect)}
    >
      <div className={style.languageName}>{languages[languageTag]}</div>
      <div className={style.languageTag}>{languageTag}</div>
    </div>
  );
}

export default LanguageItem;
