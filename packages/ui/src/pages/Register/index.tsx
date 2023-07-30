import { SignInMode } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import ConnectorSignInList from '@/containers/ConnectorSignInList';
import TermsAndPrivacy from '@/containers/TermsAndPrivacy';
import { useSieMethods } from '@/hooks/use-sie';

import ErrorPage from '../ErrorPage';

import IdentifierRegisterForm from './IdentifierRegisterForm';
import * as styles from './index.module.scss';

const Register = () => {
  const { signUpMethods, connectors, signInMode, signInMethods } = useSieMethods();
  const { t } = useTranslation();

  if (!signInMode) {
    return <ErrorPage />;
  }

  if (signInMode === SignInMode.SignIn) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <LandingPageLayout title="description.create_your_account">
      {signUpMethods.length > 0 && (
        <IdentifierRegisterForm signUpMethods={signUpMethods} className={styles.main} />
      )}
      {signUpMethods.length === 0 && connectors.length > 0 && (
        <>
          <TermsAndPrivacy className={styles.terms} />
          <ConnectorSignInList className={styles.main} connectors={connectors} />
        </>
      )}
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
        signUpMethods.length > 0 && connectors.length > 0 && (
          <>
            <Divider label="description.or" className={styles.divider} />
            <ConnectorSignInList connectors={connectors} className={styles.main} />
          </>
        )
      }
    </LandingPageLayout>
  );
};

export default Register;
