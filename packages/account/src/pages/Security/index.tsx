import { useTranslation } from 'react-i18next';

import PageFooter from '@ac/components/PageFooter';

import styles from '../Home/index.module.scss';

const Security = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('account_center.page.security_title')}</div>
        <div className={styles.description}>{t('account_center.page.security_description')}</div>
      </div>
      <div className={styles.content}>{/* Sections will be implemented here */}</div>
      <PageFooter />
    </div>
  );
};

export default Security;
