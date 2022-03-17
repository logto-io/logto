import { AdminConsoleKey } from '@logto/phrases';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  subtitle?: AdminConsoleKey;
};

type RawProps = {
  title: ReactNode;
  subtitle?: ReactNode;
};

/**
 * Do not use this component directly, unless you do not want to use translation.
 */
export const RawCardTitle = ({ title, subtitle }: RawProps) => (
  <div>
    <div className={styles.title}>{title}</div>
    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
  </div>
);

/**
 * Always use this component to render CardTitle, with built-in i18n support.
 */
const CardTitle = ({ title, subtitle }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const props: RawProps = {
    title: t(title),
    subtitle: subtitle ? t(subtitle) : undefined,
  };

  return <RawCardTitle {...props} />;
};

export default CardTitle;
