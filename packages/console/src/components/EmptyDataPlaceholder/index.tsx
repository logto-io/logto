import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import EmptyDark from '@/assets/images/table-empty-dark.svg';
import Empty from '@/assets/images/table-empty.svg';
import useTheme from '@/hooks/use-theme';
import { Theme } from '@/types/theme';

import * as styles from './index.module.scss';

export type Props = {
  title?: string;
  size?: 'large' | 'medium' | 'small';
};

const EmptyDataPlaceholder = ({ title, size = 'medium' }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const EmptyImage = theme === Theme.Light ? Empty : EmptyDark;

  return (
    <div className={classNames(styles.empty, styles[size])}>
      <EmptyImage className={styles.image} />
      <div className={styles.title}>{title ?? t('errors.empty')}</div>
    </div>
  );
};

export default EmptyDataPlaceholder;
