import { useTranslation } from 'react-i18next';

import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import LandingPageContainer from '@/containers/LandingPageContainer';
import OtherMethodsLink from '@/containers/OtherMethodsLink';
import { SocialSignInList } from '@/containers/SocialSignIn';
import { useSieMethods } from '@/hooks/use-sie';

import Main from './Main';
import * as styles from './index.module.scss';

const SignIn = () => {
  const { signInMethods, signUpMethods, socialConnectors } = useSieMethods();
  const otherMethods = signInMethods.slice(1).map(({ identifier }) => identifier);
  const { t } = useTranslation();

  return (
    <LandingPageContainer>
      <Main signInMethod={signInMethods[0]} socialConnectors={socialConnectors} />
      {
        // Other sign-in methods
        otherMethods.length > 0 && (
          <OtherMethodsLink methods={otherMethods} template="sign_in_with" flow="sign-in" />
        )
      }
      {
        // Social sign-in methods
        signInMethods.length > 0 && socialConnectors.length > 0 && (
          <>
            <Divider label="description.or" className={styles.divider} />
            <SocialSignInList isCollapseEnabled socialConnectors={socialConnectors} />
          </>
        )
      }
      {
        // Create Account footer
        signUpMethods.length > 0 && (
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
