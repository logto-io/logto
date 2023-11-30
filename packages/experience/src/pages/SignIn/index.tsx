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
import TermsAndPrivacyLinks from '@/containers/TermsAndPrivacyLinks';
import { useSieMethods } from '@/hooks/use-sie';

import ErrorPage from '../ErrorPage';

import Main from './Main';
import * as styles from './index.module.scss';

const SignInFooters = () => {
  const { t } = useTranslation();

  const { signInMethods, signUpMethods, socialConnectors, signInMode, singleSignOnEnabled } =
    useSieMethods();

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
        // Create Account footer
        signInMode === SignInMode.SignInAndRegister && signUpMethods.length > 0 && (
          <div className={styles.createAccount}>
            {t('description.no_account')}{' '}
            <TextLink replace to="/register" text="action.create_account" />
          </div>
        )
      }
      {
        // Social sign-in methods
        signInMethods.length > 0 && socialConnectors.length > 0 && (
          <>
            <Divider label="description.or" className={styles.divider} />
            <SocialSignInList socialConnectors={socialConnectors} className={styles.main} />
          </>
        )
      }
    </>
  );
};

const SignIn = () => {
  const { signInMethods, socialConnectors, signInMode } = useSieMethods();

  if (!signInMode) {
    return <ErrorPage />;
  }

  if (signInMode === SignInMode.Register) {
    return <Navigate to="/register" />;
  }

  return (
    <LandingPageLayout title="description.sign_in_to_your_account">
      <SingleSignOnFormModeContextProvider>
        <Main signInMethods={signInMethods} socialConnectors={socialConnectors} />
        <SignInFooters />
      </SingleSignOnFormModeContextProvider>

      <TermsAndPrivacyLinks className={styles.terms} />
    </LandingPageLayout>
  );
};

export default SignIn;
