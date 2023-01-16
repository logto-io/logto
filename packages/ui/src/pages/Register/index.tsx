import { SignInMode } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import LandingPageContainer from '@/containers/LandingPageContainer';
import OtherMethodsLink from '@/containers/OtherMethodsLink';
import { SocialSignInList } from '@/containers/SocialSignIn';
import { useSieMethods } from '@/hooks/use-sie';
import { UserFlow } from '@/types';

import ErrorPage from '../ErrorPage';
import Main from './Main';
import * as styles from './index.module.scss';

const Register = () => {
  const { signUpMethods, socialConnectors, signInMode } = useSieMethods();
  const otherMethods = signUpMethods.slice(1);
  const { t } = useTranslation();

  if (!signInMode || signInMode === SignInMode.SignIn) {
    return <ErrorPage />;
  }

  return (
    <LandingPageContainer>
      <Main signUpMethod={signUpMethods[0]} socialConnectors={socialConnectors} />
      {
        // Other create account methods
        otherMethods.length > 0 && (
          <OtherMethodsLink
            className={styles.otherMethods}
            methods={otherMethods}
            template="register_with"
            flow={UserFlow.register}
          />
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
      {
        // SignIn footer
        signInMode === SignInMode.SignInAndRegister && signUpMethods.length > 0 && (
          <>
            <div className={styles.placeHolder} />
            <div className={styles.createAccount}>
              {t('description.have_account')}{' '}
              <TextLink replace to="/sign-in" text="action.sign_in" />
            </div>
          </>
        )
      }
    </LandingPageContainer>
  );
};

export default Register;
