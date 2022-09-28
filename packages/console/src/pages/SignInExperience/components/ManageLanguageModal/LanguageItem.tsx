import { languages, LanguageTag } from '@logto/language-kit';
import classNames from 'classnames';

import * as style from './LanguageItem.module.scss';

type Props = {
  languageTag: LanguageTag;
  isSelected: boolean;
  onClick: () => void;
};

const LanguageItem = ({ languageTag: languageKey, isSelected, onClick }: Props) => {
  return (
    <div className={classNames(style.languageItem, isSelected && style.selected)} onClick={onClick}>
      <div className={style.languageName}>{languages[languageKey]}</div>
      <div className={style.languageKey}>{languageKey}</div>
    </div>
  );
};

export default LanguageItem;
