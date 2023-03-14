import classNames from 'classnames';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyDark from '@/assets/images/table-empty-dark.svg';
import Empty from '@/assets/images/table-empty.svg';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

import * as styles from './index.module.scss';

export type Props = {
  title?: string;
  size?: 'large' | 'medium' | 'small';
};

const EmptyDataPlaceholder = ({ title, size = 'medium' }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { theme } = useContext(AppThemeContext);
  const EmptyImage = theme === Theme.LightMode ? Empty : EmptyDark;

  return (
    <div className={classNames(styles.empty, styles[size])}>
      <EmptyImage className={styles.image} />
      <div className={styles.title}>{title ?? t('errors.empty')}</div>
    </div>
  );
};

export default EmptyDataPlaceholder;
