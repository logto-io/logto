import { AdminConsoleKey } from '@logto/phrases';
import React from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  subtitle?: AdminConsoleKey;
};

/**
 * Always use this component to render CardTitle, with built-in i18n support.
 */
const CardTitle = ({ title, subtitle }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div>
      <div className={styles.title}>{t(title)}</div>
      {subtitle && <div className={styles.subtitle}>{t(subtitle)}</div>}
    </div>
  );
};

export default CardTitle;
