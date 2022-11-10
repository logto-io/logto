import { useTranslation } from 'react-i18next';
import type { TFuncKey } from 'react-i18next';

import NavBar from '@/components/NavBar';

import * as styles from './index.module.scss';

type Props = {
  title?: TFuncKey;
  description?: TFuncKey;
  titleProps?: Record<string, unknown>;
  descriptionProps?: Record<string, unknown>;
  children: React.ReactNode;
};

const SecondaryPageWrapper = ({
  title,
  description,
  titleProps,
  descriptionProps,
  children,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.header}>
          {title && <div className={styles.title}>{t(title, titleProps)}</div>}
          {description && (
            <div className={styles.description}>{t(description, descriptionProps)}</div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};

export default SecondaryPageWrapper;
