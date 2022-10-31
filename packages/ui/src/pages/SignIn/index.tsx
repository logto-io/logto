import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import LandingPageContainer from '@/containers/LandingPageContainer';
import SignInMethodsLink from '@/containers/SignInMethodsLink';
import { SocialSignInList } from '@/containers/SocialSignIn';
import { useSieMethods } from '@/hooks/use-sie';

import Main from './Main';
import * as styles from './index.module.scss';

const SignIn = () => {
  const { signInMethods, signUpMethods, socialConnectors } = useSieMethods();
  const otherMethods = signInMethods.slice(1);

  return (
    <LandingPageContainer>
      <Main signInMethod={signInMethods[0]} socialConnectors={socialConnectors} />
      {
        // Other sign-in methods
        otherMethods.length > 0 && (
          <SignInMethodsLink signInMethods={otherMethods} template="sign_in_with" />
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
            <TextLink
              replace
              className={styles.createAccount}
              to="/register"
              text="action.create_account"
            />
          </>
        )
      }
    </LandingPageContainer>
  );
};

export default SignIn;
