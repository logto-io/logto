import classNames from 'classnames';
import React, { ReactChild, ReactNode, useState } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getPath } from '../../utils';
import * as styles from './index.module.scss';

type Props = {
  icon?: ReactChild;
  titleKey: TFuncKey<'translation', 'admin_console.tabs'>;
  isActive?: boolean;
  modal?: (isOpen: boolean, onCancel: () => void) => ReactNode;
};

const Item = ({ icon, titleKey, modal, isActive = false }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tabs',
  });
  const [isOpen, setIsOpen] = useState(false);

  const content = (
    <>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.title}>{t(titleKey)}</div>
    </>
  );

  if (!modal) {
    return (
      <Link to={getPath(titleKey)} className={classNames(styles.row, isActive && styles.active)}>
        {content}
      </Link>
    );
  }

  return (
    <>
      <button
        className={styles.row}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {content}
      </button>
      {modal(isOpen, () => {
        setIsOpen(false);
      })}
    </>
  );
};

export default Item;
