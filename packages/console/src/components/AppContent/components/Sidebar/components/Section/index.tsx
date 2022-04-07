import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  title: string;
  children: ReactNode;
};

const Section = ({ children, title }: Props) => {
  const {
    i18n: { language },
  } = useTranslation();

  const languageClassname = language.split('-')[0];

  return (
    <div>
      <div className={classNames(styles.title, languageClassname && styles[languageClassname])}>
        {title}
      </div>
      {children}
    </div>
  );
};

export default Section;
