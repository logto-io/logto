import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '../Card';
import TextLink from '../TextLink';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  description?: AdminConsoleKey;
  learnMoreLink?: string;
  children: ReactNode;
};

function FormCard({ title, description, learnMoreLink, children }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Card className={styles.container}>
      <div className={styles.introduction}>
        <div className={styles.title}>{t(title)}</div>
        {description && (
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
        )}
      </div>
      <div className={styles.form}>{children}</div>
    </Card>
  );
}

export default FormCard;
