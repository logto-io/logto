import { AgreeToTermsPolicy, experience, ExtraParamsKey, SignInMode } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useSearchParams } from 'react-router-dom';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import SingleSignOnFormModeContext from '@/Providers/SingleSignOnFormModeContextProvider/SingleSignOnFormModeContext';
import WebAuthnContextProvider from '@/Providers/WebAuthnContextProvider';
import PasskeySignInButton from '@/components/Button/PasskeySignInButton';
import GoogleOneTap from '@/components/GoogleOneTap';
import TextLink from '@/components/TextLink';
import SocialSignInList from '@/containers/SocialSignInList';
import TermsAndPrivacyCheckbox from '@/containers/TermsAndPrivacyCheckbox';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { useSieMethods } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';

import ErrorPage from '../ErrorPage';

import Main from './Main';
import styles from './index.module.scss';

const SignInFooters = () => {
  const { t } = useTranslation();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const navigate = useNavigateWithPreservedSearchParams();

  const {
    signInMethods,
    signUpMethods,
    socialConnectors,
    signInMode,
    singleSignOnEnabled,
    passkeySignIn,
  } = useSieMethods();

  const { showSingleSignOnForm } = useContext(SingleSignOnFormModeContext);

  const handleSsoNavigation = useCallback(async () => {
    /**
     * Check if the user has agreed to the terms and privacy policy before navigating to the SSO page
     * when the policy is set to `Manual`
     */
    if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
      return;
    }
    navigate('/single-sign-on/email');
  }, [agreeToTermsPolicy, navigate, termsValidation]);

  /* Hide footers when showing Single Sign On form */
  if (showSingleSignOnForm) {
    return null;
  }

  const showSocialSignIn = signInMethods.length > 0 && socialConnectors.length > 0;
  const showPasskeySignIn = passkeySignIn?.enabled && passkeySignIn.showPasskeyButton;
  const showSingleSignOn = !!singleSignOnEnabled;
  const showCreateAccount = signInMode === SignInMode.SignInAndRegister && signUpMethods.length > 0;

  const asideContent =
    showSingleSignOn || showCreateAccount ? (
      <>
        {
          // Single Sign On footer
          showSingleSignOn && (
            <>
              <div className={styles.singleSignOn}>
                {t('description.use')}{' '}
                <TextLink
                  className={styles.link}
                  text="action.single_sign_on"
                  onClick={handleSsoNavigation}
                />
              </div>
              {
                /**
                 * If only SSO sign-in methods are available, display the agreement checkbox when the agreement policy is `Manual`.
                 */
                signInMethods.length === 0 &&
                  socialConnectors.length === 0 &&
                  agreeToTermsPolicy === AgreeToTermsPolicy.Manual && (
                    <TermsAndPrivacyCheckbox className={styles.checkboxForSsoOnly} />
                  )
              }
            </>
          )
        }
        {
          // Create Account footer
          showCreateAccount && (
            <div className={styles.createAccount}>
              {t('description.no_account')}{' '}
              <TextLink
                replace
                className={styles.link}
                to="/register"
                text="action.create_account"
              />
            </div>
          )
        }
      </>
    ) : null;

  return (
    <>
      {
        // Social sign-in methods
        showSocialSignIn && (
          <SocialSignInList socialConnectors={socialConnectors} className={styles.main} />
        )
      }

      {/* Passkey Sign In */}
      {showPasskeySignIn && <PasskeySignInButton />}

      {asideContent}
    </>
  );
};

const SignIn = () => {
  const { signInMethods, socialConnectors, signInMode } = useSieMethods();
  const [params] = useSearchParams();

  if (!signInMode) {
    return <ErrorPage />;
  }

  if (signInMode === SignInMode.Register) {
    return <Navigate to="/register" />;
  }

  if (params.get(ExtraParamsKey.OneTimeToken)) {
    return (
      <Navigate
        replace
        to={{ pathname: `/${experience.routes.oneTimeToken}`, search: `?${params.toString()}` }}
      />
    );
  }

  return (
    <LandingPageLayout title="description.sign_in_to_your_account">
      <GoogleOneTap context="signin" />
      <WebAuthnContextProvider>
        <SingleSignOnFormModeContextProvider>
          <Main signInMethods={signInMethods} socialConnectors={socialConnectors} />
          <SignInFooters />
        </SingleSignOnFormModeContextProvider>
      </WebAuthnContextProvider>
      {/* {
        // Only show terms and privacy links for sign in page if the agree to terms policy is `Automatic` or `ManualRegistrationOnly`
        agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && (
          <TermsAndPrivacyLinks className={styles.terms} />
        )
      } */}
    </LandingPageLayout>
  );
};

export default SignIn;
