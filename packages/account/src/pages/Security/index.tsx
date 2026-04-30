import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import PageFooter from '@ac/components/PageFooter';
import { layoutClassNames } from '@ac/constants/layout';

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
        <div className={classNames(styles.title, layoutClassNames.pageTitle)}>
          {t('account_center.page.security_title')}
        </div>
        <div className={classNames(styles.description, layoutClassNames.pageDescription)}>
          {t('account_center.page.security_description')}
        </div>
      </div>
      <div className={classNames(styles.content, layoutClassNames.pageContent)}>
        <UsernameSection />
        <EmailPhoneSection />
        <PasswordSection />
        <SocialSection />
        <MfaSection />
        <DeleteAccountSection />
      </div>
      <PageFooter />
    </div>
  );
};

export default Security;
