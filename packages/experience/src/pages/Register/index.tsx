import { SignInMode } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import SingleSignOnFormModeContext from '@/Providers/SingleSignOnFormModeContextProvider/SingleSignOnFormModeContext';
import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import SocialSignInList from '@/containers/SocialSignInList';
import TermsAndPrivacyCheckbox from '@/containers/TermsAndPrivacyCheckbox';
import { useSieMethods } from '@/hooks/use-sie';

import ErrorPage from '../ErrorPage';

import IdentifierRegisterForm from './IdentifierRegisterForm';
import * as styles from './index.module.scss';

const RegisterFooter = () => {
  const { signUpMethods, socialConnectors, signInMode, signInMethods, singleSignOnEnabled } =
    useSieMethods();

  const { t } = useTranslation();

  const { showSingleSignOnForm } = useContext(SingleSignOnFormModeContext);

  /* Hide footers when showing Single Sign On form */
  if (showSingleSignOnForm) {
    return null;
  }

  return (
    <>
      {
        // Single Sign On footer
        singleSignOnEnabled && (
          <div className={styles.singleSignOn}>
            {t('description.use')}{' '}
            <TextLink to="/single-sign-on/email" text="action.single_sign_on" />
          </div>
        )
      }
      {
        // SignIn footer
        signInMode === SignInMode.SignInAndRegister && signInMethods.length > 0 && (
          <div className={styles.createAccount}>
            {t('description.have_account')} <TextLink replace to="/sign-in" text="action.sign_in" />
          </div>
        )
      }
      {
        // Social sign-in methods
        signUpMethods.length > 0 && socialConnectors.length > 0 && (
          <>
            <Divider label="description.or" className={styles.divider} />
            <SocialSignInList socialConnectors={socialConnectors} className={styles.main} />
          </>
        )
      }
    </>
  );
};

const Register = () => {
  const { signUpMethods, socialConnectors, signInMode } = useSieMethods();

  if (!signInMode) {
    return <ErrorPage />;
  }

  if (signInMode === SignInMode.SignIn) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <LandingPageLayout title="description.create_your_account">
      <SingleSignOnFormModeContextProvider>
        {signUpMethods.length > 0 && (
          <IdentifierRegisterForm signUpMethods={signUpMethods} className={styles.main} />
        )}
        {/* Social sign-in methods only */}
        {signUpMethods.length === 0 && socialConnectors.length > 0 && (
          <>
            <TermsAndPrivacyCheckbox className={styles.terms} />
            <SocialSignInList className={styles.main} socialConnectors={socialConnectors} />
          </>
        )}
        <RegisterFooter />
      </SingleSignOnFormModeContextProvider>

      {/* Hide footer elements when showing Single Sign On form */}
    </LandingPageLayout>
  );
};

export default Register;
