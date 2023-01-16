import { AppearanceMode } from '@logto/schemas';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyDark from '@/assets/images/table-empty-dark.svg';
import Empty from '@/assets/images/table-empty.svg';
import { useTheme } from '@/hooks/use-theme';

import * as styles from './index.module.scss';

export type Props = {
  title?: string;
  description?: string;
  image?: ReactNode;
  children?: ReactNode;
  imageClassName?: string;
};

const DataEmpty = ({ title, description, image, imageClassName, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const theme = useTheme();

  return (
    <div className={styles.empty}>
      {image ??
        (theme === AppearanceMode.LightMode ? (
          <Empty className={imageClassName} />
        ) : (
          <EmptyDark className={imageClassName} />
        ))}
      <div className={styles.title}>{title ?? t('errors.empty')}</div>
      {description && <div className={styles.description}>{description}</div>}
      {children}
    </div>
  );
};

export default DataEmpty;
