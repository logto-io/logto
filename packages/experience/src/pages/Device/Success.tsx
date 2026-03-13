import { useTranslation } from 'react-i18next';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import CheckMark from '@/assets/icons/check-mark.svg?react';
import PageMeta from '@/shared/components/PageMeta';

import styles from './Success.module.scss';

const Success = () => {
  const { t } = useTranslation();

  return (
    <StaticPageLayout>
      <PageMeta titleKey="description.device_activation_success" />
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <CheckMark className={styles.icon} />
        </div>
        <div className={styles.title}>{t('description.device_activation_success')}</div>
        <div className={styles.description}>
          {t('description.device_activation_success_description')}
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Success;
