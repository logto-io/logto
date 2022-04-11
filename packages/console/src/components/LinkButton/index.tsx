import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import DangerousRaw from '../DangerousRaw';
import * as styles from './index.module.scss';

type Props = {
  to: string;
  title: I18nKey | ReactElement<typeof DangerousRaw>;
  icon?: ReactNode;
  className?: string;
};

const LinkButton = ({ to, title, icon, className }: Props) => {
  const { t } = useTranslation();

  return (
    <Link to={to} className={classNames(styles.linkButton, className)}>
      {icon}
      {typeof title === 'string' ? <span>{t(title)}</span> : title}
    </Link>
  );
};

export default LinkButton;
