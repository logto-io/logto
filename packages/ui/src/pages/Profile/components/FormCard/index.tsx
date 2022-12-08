import type { I18nKey } from '@logto/phrases-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  title: I18nKey;
  children: ReactNode;
};

const FormCard = ({ title, children }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t(title)}</div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default FormCard;
