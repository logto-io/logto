import { languages, LanguageTag } from '@logto/language-kit';
import classNames from 'classnames';

import * as style from './LanguageItem.module.scss';

type Props = {
  languageTag: LanguageTag;
  isSelected: boolean;
  onClick: () => void;
};

const LanguageItem = ({ languageTag, isSelected, onClick }: Props) => {
  return (
    <div className={classNames(style.languageItem, isSelected && style.selected)} onClick={onClick}>
      <div className={style.languageName}>{languages[languageTag]}</div>
      <div className={style.languageKey}>{languageTag}</div>
    </div>
  );
};

export default LanguageItem;
