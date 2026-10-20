import { AgreeToTermsPolicy, experience, ExtraParamsKey, SignInMode } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useSearchParams } from 'react-router-dom';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import SingleSignOnFormModeContext from '@/Providers/SingleSignOnFormModeContextProvider/SingleSignOnFormModeContext';
import GoogleOneTap from '@/components/GoogleOneTap';
import IdentifierRegisterForm from '@/components/IdentifierRegisterForm';
import TextLink from '@/components/TextLink';
import SocialSignInList from '@/containers/SocialSignInList';
import TermsAndPrivacyCheckbox from '@/containers/TermsAndPrivacyCheckbox';
import TermsAndPrivacyLinks from '@/containers/TermsAndPrivacyLinks';
import { useSieMethods } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';

import ErrorPage from '../ErrorPage';

import styles from './index.module.scss';

const RegisterFooter = () => {
  const { t } = useTranslation();
  const { signUpMethods, socialConnectors, signInMode, signInMethods } = useSieMethods();
  const [params] = useSearchParams();

  const { showSingleSignOnForm } = useContext(SingleSignOnFormModeContext);

  if (params.get(ExtraParamsKey.OneTimeToken)) {
    return (
      <Navigate
        replace
        to={{ pathname: `/${experience.routes.oneTimeToken}`, search: `?${params.toString()}` }}
      />
    );
  }

  /* Hide footers when showing Single Sign On form */
  if (showSingleSignOnForm) {
    return null;
  }

  const showSocialSignIn = signUpMethods.length > 0 && socialConnectors.length > 0;
  const showSignIn = signInMode === SignInMode.SignInAndRegister && signInMethods.length > 0;

  const asideContent = showSignIn ? (
    <div className={styles.createAccount}>
      {t('description.have_account')}{' '}
      <TextLink replace className={styles.link} to="/sign-in" text="action.sign_in" />
    </div>
  ) : null;

  return (
    <>
      {
        // Social sign-in methods
        showSocialSignIn && (
          <SocialSignInList socialConnectors={socialConnectors} className={styles.main} />
        )
      }

      {asideContent}
    </>
  );
};

const Register = () => {
  const { signUpMethods, socialConnectors, signInMode } = useSieMethods();
  const { agreeToTermsPolicy } = useTerms();

  if (!signInMode) {
    return <ErrorPage />;
  }

  if (signInMode === SignInMode.SignIn) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <LandingPageLayout headlineText="Create an account" title="description.create_your_account">
      <GoogleOneTap context="signup" />
      <SingleSignOnFormModeContextProvider>
        {signUpMethods.length > 0 && (
          <IdentifierRegisterForm signUpMethods={signUpMethods} className={styles.main} />
        )}
        {/* Social sign-in methods only */}
        {signUpMethods.length === 0 && socialConnectors.length > 0 && (
          <>
            {agreeToTermsPolicy !== AgreeToTermsPolicy.Automatic && (
              <TermsAndPrivacyCheckbox className={styles.terms} />
            )}
            <SocialSignInList className={styles.main} socialConnectors={socialConnectors} />
          </>
        )}
        <RegisterFooter />
        {agreeToTermsPolicy === AgreeToTermsPolicy.Automatic && (
          <TermsAndPrivacyLinks className={styles.terms} />
        )}
      </SingleSignOnFormModeContextProvider>
      {/* Hide footer elements when showing Single Sign On form */}
    </LandingPageLayout>
  );
};

export default Register;
