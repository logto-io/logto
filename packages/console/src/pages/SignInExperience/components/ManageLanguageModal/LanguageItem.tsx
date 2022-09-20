import { LanguageKey } from '@logto/core-kit';
import { languageCodeAndDisplayNameMappings } from '@logto/phrases-ui';
import classNames from 'classnames';

import * as style from './LanguageItem.module.scss';

type Props = {
  languageKey: LanguageKey;
  isSelected: boolean;
  onClick: () => void;
};

const LanguageItem = ({ languageKey, isSelected, onClick }: Props) => {
  return (
    <div className={classNames(style.languageItem, isSelected && style.selected)} onClick={onClick}>
      <div className={style.languageName}>{languageCodeAndDisplayNameMappings[languageKey]}</div>
      <div className={style.languageKey}>{languageKey}</div>
    </div>
  );
};

export default LanguageItem;
