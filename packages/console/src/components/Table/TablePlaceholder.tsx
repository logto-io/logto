import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

import TextLink from '../TextLink';
import * as styles from './TablePlaceholder.module.scss';

type Props = {
  image: ReactNode;
  imageDark: ReactNode;
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  learnMoreLink?: string;
  action: ReactNode;
};

const TablePlaceholder = ({
  image,
  imageDark,
  title,
  description,
  learnMoreLink,
  action,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { theme } = useContext(AppThemeContext);

  return (
    <div className={styles.placeholder}>
      <div className={styles.image}>{theme === Theme.LightMode ? image : imageDark}</div>
      <div className={styles.title}>{t(title)}</div>
      <div className={styles.description}>
        {t(description)}
        {learnMoreLink && (
          <>
            {' '}
            <TextLink href={learnMoreLink} target="_blank" rel="noopener">
              {t('general.learn_more')}
            </TextLink>
          </>
        )}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default TablePlaceholder;
