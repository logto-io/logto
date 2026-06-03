import classNames from 'classnames';

import AccountPageHeader from '@ac/components/AccountPageHeader';
import PageFooter from '@ac/components/PageFooter';
import { layoutClassNames } from '@ac/constants/layout';

import styles from '../Home/index.module.scss';

import DeleteAccountSection from './DeleteAccountSection';
import EmailPhoneSection from './EmailPhoneSection';
import MfaSection from './MfaSection';
import PasswordSection from './PasswordSection';
import SessionSection from './SessionSection';
import SocialSection from './SocialSection';
import UsernameSection from './UsernameSection';

const Security = () => {
  return (
    <div className={styles.container}>
      <AccountPageHeader
        titleKey="account_center.page.security_title"
        descriptionKey="account_center.page.security_description"
      />
      <div className={classNames(styles.content, layoutClassNames.pageContent)}>
        <UsernameSection />
        <EmailPhoneSection />
        <PasswordSection />
        <SocialSection />
        <MfaSection />
        <SessionSection />
        <DeleteAccountSection />
      </div>
      <PageFooter />
    </div>
  );
};

export default Security;
