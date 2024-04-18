import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyDark from '@/assets/images/table-empty-dark.svg';
import Empty from '@/assets/images/table-empty.svg';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

type Props = {
  readonly title?: ReactNode;
  readonly size?: 'large' | 'medium' | 'small';
  readonly className?: string;
};

function EmptyDataPlaceholder({ title, size = 'medium', className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const EmptyImage = theme === Theme.Light ? Empty : EmptyDark;

  return (
    <div className={classNames(styles.empty, styles[size], className)}>
      <div className={styles.topSpace} />
      <EmptyImage className={styles.image} />
      <div className={styles.title}>{title ?? t('errors.empty')}</div>
      <div className={styles.bottomSpace} />
    </div>
  );
}

export default EmptyDataPlaceholder;
