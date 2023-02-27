import { SignInMode } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import LandingPageContainer from '@/containers/LandingPageContainer';
import SocialSignIn, { SocialSignInList } from '@/containers/SocialSignIn';
import { useSieMethods } from '@/hooks/use-sie';

import ErrorPage from '../ErrorPage';
import IdentifierRegisterForm from './IdentifierRegisterForm';
import * as styles from './index.module.scss';

const Register = () => {
  const { signUpMethods, socialConnectors, signInMode, signInMethods } = useSieMethods();
  const { t } = useTranslation();

  if (!signInMode || signInMode === SignInMode.SignIn) {
    return <ErrorPage />;
  }

  return (
    <LandingPageContainer title="description.create_your_account">
      {signUpMethods.length > 0 && (
        <IdentifierRegisterForm signUpMethods={signUpMethods} className={styles.main} />
      )}
      {signUpMethods.length === 0 && socialConnectors.length > 0 && (
        <SocialSignIn className={styles.main} socialConnectors={socialConnectors} />
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
        signUpMethods.length > 0 && socialConnectors.length > 0 && (
          <>
            <Divider label="description.or" className={styles.divider} />
            <SocialSignInList socialConnectors={socialConnectors} className={styles.main} />
          </>
        )
      }
    </LandingPageContainer>
  );
};

export default Register;
