import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '../Card';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  description?: AdminConsoleKey;
  learnMoreLink?: string;
  children: ReactNode;
};

const FormCard = ({ title, description, learnMoreLink, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Card className={styles.container}>
      <div className={styles.introduction}>
        <div className={styles.title}>{t(title)}</div>
        {description && (
          <div className={styles.description}>
            {t(description)}
            {learnMoreLink && (
              <a href={learnMoreLink} target="_blank" rel="noopener">
                {t('general.learn_more')}
              </a>
            )}
          </div>
        )}
      </div>
      <div className={styles.form}>{children}</div>
    </Card>
  );
};

export default FormCard;
