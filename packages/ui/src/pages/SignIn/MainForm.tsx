import { useContext } from 'react';

import { EmailPasswordless, PhonePasswordless } from '@/containers/Passwordless';
import { PrimarySocialSignIn } from '@/containers/SocialSignIn';
import UsernameSignIn from '@/containers/UsernameSignIn';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

const MainForm = () => {
  const { experienceSettings } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const { signIn, socialConnectors } = experienceSettings;
  const primarySignInMethod = signIn.methods[0];

  switch (primarySignInMethod?.identifier) {
    case 'email':
      return <EmailPasswordless type="sign-in" className={styles.primarySignIn} />;
    case 'sms':
      return <PhonePasswordless type="sign-in" className={styles.primarySignIn} />;
    case 'username':
      return <UsernameSignIn className={styles.primarySignIn} />;

    default: {
      if (socialConnectors.length > 0) {
        return <PrimarySocialSignIn className={styles.primarySocial} />;
      }

      return null;
    }
  }
};

export default MainForm;
