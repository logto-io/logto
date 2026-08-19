import classNames from 'classnames';

import AccountPageHeader from '@ac/components/AccountPageHeader';
import PageFooter from '@ac/components/PageFooter';
import { isDevFeaturesEnabled } from '@ac/constants/env';
import { layoutClassNames } from '@ac/constants/layout';

import styles from '../Home/index.module.scss';

import DeleteAccountSection from './DeleteAccountSection';
import EmailPhoneSection from './EmailPhoneSection';
import MfaSection from './MfaSection';
import MfaVerificationsProvider from './MfaVerificationsProvider';
import PasskeySection from './PasskeySection';
import PasswordSection from './PasswordSection';
import SocialSection from './SocialSection';
import TrustedDevicesSection from './TrustedDevicesSection';
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
        <MfaVerificationsProvider>
          <PasskeySection />
          <MfaSection />
        </MfaVerificationsProvider>
        {/* DEV: MFA trusted device management */}
        {isDevFeaturesEnabled && <TrustedDevicesSection />}
        <DeleteAccountSection />
      </div>
      <PageFooter />
    </div>
  );
};

export default Security;
