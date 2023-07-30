import { SignInMode } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import ConnectorSignInList from '@/containers/ConnectorSignInList';
import TermsAndPrivacyLinks from '@/containers/TermsAndPrivacyLinks';
import { useSieMethods } from '@/hooks/use-sie';

import ErrorPage from '../ErrorPage';

import Main from './Main';
import * as styles from './index.module.scss';

const SignIn = () => {
  const { signInMethods, signUpMethods, connectors, signInMode } = useSieMethods();
  const { t } = useTranslation();

  if (!signInMode) {
    return <ErrorPage />;
  }

  if (signInMode === SignInMode.Register) {
    return <Navigate to="/register" />;
  }

  return (
    <LandingPageLayout title="description.sign_in_to_your_account">
      <Main signInMethods={signInMethods} connectors={connectors} />
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
        signInMethods.length > 0 && connectors.length > 0 && (
          <>
            <Divider label="description.or" className={styles.divider} />
            <ConnectorSignInList connectors={connectors} className={styles.main} />
          </>
        )
      }
      <TermsAndPrivacyLinks className={styles.terms} />
    </LandingPageLayout>
  );
};

export default SignIn;
