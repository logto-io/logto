import classNames from 'classnames';
import React, { ReactChild } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getPath } from '../../utils';
import * as styles from './index.module.scss';

type Props = {
  icon?: ReactChild;
  titleKey: TFuncKey<'translation', 'admin_console.tabs'>;
  isActive?: boolean;
};

const Item = ({ icon, titleKey, isActive = false }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tabs',
  });

  return (
    <Link to={getPath(titleKey)} className={classNames(styles.row, isActive && styles.active)}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.title}>{t(titleKey)}</div>
    </Link>
  );
};

export default Item;
