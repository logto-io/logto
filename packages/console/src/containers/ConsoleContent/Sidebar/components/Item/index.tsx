import classNames from 'classnames';
import type { ReactChild, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getPath } from '../../utils';
import * as styles from './index.module.scss';

type Props = {
  icon?: ReactChild;
  titleKey: TFuncKey<'translation', 'admin_console.tabs'>;
  isActive?: boolean;
  modal?: (isOpen: boolean, onCancel: () => void) => ReactNode;
  externalLink?: string;
};

function Item({ icon, titleKey, modal, externalLink, isActive = false }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tabs',
  });
  const [isOpen, setIsOpen] = useState(false);

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
}

export default Item;
