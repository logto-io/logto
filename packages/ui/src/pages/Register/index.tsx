import { useTranslation } from 'react-i18next';

import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import LandingPageContainer from '@/containers/LandingPageContainer';
import SignInMethodsLink from '@/containers/SignInMethodsLink';
import { SocialSignInList } from '@/containers/SocialSignIn';
import { useSieMethods } from '@/hooks/use-sie';

import Main from './Main';
import * as styles from './index.module.scss';

const Register = () => {
  const { signUpMethods, socialConnectors } = useSieMethods();
  const otherMethods = signUpMethods.slice(1);
  const { t } = useTranslation();

  return (
    <LandingPageContainer>
      <Main signUpMethod={signUpMethods[0]} socialConnectors={socialConnectors} />
      {
        // Other create account methods
        otherMethods.length > 0 && (
          <SignInMethodsLink methods={otherMethods} template="register_with" />
        )
      }
      {
        // Social sign-in methods
        signUpMethods.length > 0 && socialConnectors.length > 0 && (
          <>
            <Divider label="description.or" className={styles.divider} />
            <SocialSignInList isCollapseEnabled socialConnectors={socialConnectors} />
          </>
        )
      }
      {
        // SignIn footer
        signUpMethods.length > 0 && (
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
