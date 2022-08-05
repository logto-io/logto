import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import DangerousRaw from '../DangerousRaw';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  subtitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  size?: 'small' | 'medium' | 'large';
};

/**
 * Always use this component to render CardTitle, with built-in i18n support.
 */
const CardTitle = ({ title, subtitle, size = 'large' }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.container, styles[size])}>
      <div className={styles.title}>{typeof title === 'string' ? String(t(title)) : title}</div>
      {subtitle && (
        <div className={styles.subtitle}>
          {typeof subtitle === 'string' ? String(t(subtitle)) : subtitle}
        </div>
      )}
    </div>
  );
};

export default CardTitle;
