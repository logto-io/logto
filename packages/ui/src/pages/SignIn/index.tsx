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

const SignIn = () => {
  const { signInMethods, signUpMethods, socialConnectors, signInMode } = useSieMethods();
  const otherMethods = signInMethods.slice(1).map(({ identifier }) => identifier);
  const { t } = useTranslation();

  if (!signInMode || signInMode === SignInMode.Register) {
    return <ErrorPage />;
  }

  return (
    <LandingPageContainer>
      <Main signInMethod={signInMethods[0]} socialConnectors={socialConnectors} />
      {
        // Other sign-in methods
        otherMethods.length > 0 && (
          <OtherMethodsLink
            className={styles.otherMethods}
            methods={otherMethods}
            template="sign_in_with"
            flow={UserFlow.signIn}
            search={location.search}
          />
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
      {
        // Create Account footer
        signInMode === SignInMode.SignInAndRegister && signUpMethods.length > 0 && (
          <>
            <div className={styles.placeHolder} />
            <div className={styles.createAccount}>
              {t('description.no_account')}{' '}
              <TextLink replace to="/register" text="action.create_account" />
            </div>
          </>
        )
      }
    </LandingPageContainer>
  );
};

export default SignIn;
