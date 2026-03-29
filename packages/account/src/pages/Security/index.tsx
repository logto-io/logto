import { useTranslation } from 'react-i18next';

import PageFooter from '@ac/components/PageFooter';
import { isDevFeaturesEnabled } from '@ac/constants/env';

import styles from '../Home/index.module.scss';

import DeleteAccountSection from './DeleteAccountSection';
import EmailPhoneSection from './EmailPhoneSection';
import MfaSection from './MfaSection';
import PasswordSection from './PasswordSection';
import SocialSection from './SocialSection';
import UsernameSection from './UsernameSection';

const Security = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('account_center.page.security_title')}</div>
        <div className={styles.description}>{t('account_center.page.security_description')}</div>
      </div>
      <div className={styles.content}>
        <UsernameSection />
        <EmailPhoneSection />
        <PasswordSection />
        <SocialSection />
        <MfaSection />
        {isDevFeaturesEnabled && <DeleteAccountSection />}
      </div>
      <PageFooter />
    </div>
  );
};

export default Security;
