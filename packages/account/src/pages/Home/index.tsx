import { useTranslation } from 'react-i18next';

import ErrorPage from '@ac/components/ErrorPage';
import PageFooter from '@ac/components/PageFooter';
import { isDevFeaturesEnabled } from '@ac/constants/env';

import styles from './index.module.scss';

const Home = () => {
  const { t } = useTranslation();

  if (!isDevFeaturesEnabled) {
    return (
      <ErrorPage
        titleKey="account_center.home.title"
        messageKey="account_center.home.description"
      />
    );
  }

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

export default Home;
