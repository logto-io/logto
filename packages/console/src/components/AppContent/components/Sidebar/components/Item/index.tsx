import classNames from 'classnames';
import React, { MouseEventHandler, ReactChild, useState } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getPath } from '../../utils';
import Contact from '../Contact';
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
  const [isContactOpen, setIsContactOpen] = useState(false);
  const isContactUs = titleKey === 'community_support';

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!isContactUs) {
      return;
    }

    event.preventDefault();
    setIsContactOpen(true);
  };

  return (
    <>
      <Link
        to={getPath(titleKey)}
        className={classNames(styles.row, isActive && styles.active)}
        onClick={handleClick}
      >
        {icon && <div className={styles.icon}>{icon}</div>}
        <div className={styles.title}>{t(titleKey)}</div>
      </Link>
      {isContactUs && (
        <Contact
          isOpen={isContactOpen}
          onCancel={() => {
            setIsContactOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Item;
