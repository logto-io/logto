import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Card from '../Card';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  children: ReactNode;
};

const FormCard = ({ title, description, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Card className={styles.container}>
      <div className={styles.introduction}>
        <div className={styles.title}>{t(title)}</div>
        <div className={styles.description}>
          {t(description)} {/* TODO: @Yijun update this link when @Guamian is ready for this */}{' '}
          <Link to="#">{t('general.learn_more')}</Link>
        </div>
      </div>
      <div className={styles.form}>{children}</div>
    </Card>
  );
};

export default FormCard;
