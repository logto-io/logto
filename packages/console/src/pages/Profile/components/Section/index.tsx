import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  children: ReactNode;
};

const Section = ({ title, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t(title)}</div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Section;
