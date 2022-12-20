import classNames from 'classnames';
import type { ReactChild } from 'react';
import { useMemo } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getPath } from '../../utils';
import ModalItem from './ModalItem';
import type { Props as ModalItemProps } from './ModalItem';
import * as styles from './index.module.scss';

type Props = {
  icon?: ReactChild;
  titleKey: TFuncKey<'translation', 'admin_console.tabs'>;
  isActive?: boolean;
  modal?: Omit<ModalItemProps, 'content'>;
  externalLink?: string;
};

const Item = ({ icon, titleKey, modal, externalLink, isActive = false }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tabs',
  });

  const content = useMemo(
    () => (
      <>
        {icon && <div className={styles.icon}>{icon}</div>}
        <div className={styles.title}>{t(titleKey)}</div>
      </>
    ),
    [icon, t, titleKey]
  );

  if (modal) {
    return <ModalItem {...modal} content={content} />;
  }

  if (externalLink) {
    return (
      <a href={externalLink} target="_blank" className={styles.row} rel="noopener">
        {content}
      </a>
    );
  }

  return (
    <Link to={getPath(titleKey)} className={classNames(styles.row, isActive && styles.active)}>
      {content}
    </Link>
  );
};

export default Item;
