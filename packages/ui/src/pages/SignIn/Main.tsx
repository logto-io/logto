import type { SignIn as SignInType, ConnectorMetadata } from '@logto/schemas';

import EmailPassword from '@/containers/EmailPassword';
import { EmailPasswordless, PhonePasswordless } from '@/containers/Passwordless';
import PhonePassword from '@/containers/PhonePassword';
import SocialSignIn from '@/containers/SocialSignIn';
import UsernameSignIn from '@/containers/UsernameSignIn';
import type { ArrayElement } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  signInMethod?: ArrayElement<SignInType['methods']>;
  socialConnectors: ConnectorMetadata[];
};

const Main = ({ signInMethod, socialConnectors }: Props) => {
  if (!signInMethod) {
    return socialConnectors.length > 0 ? <SocialSignIn /> : null;
  }

  switch (signInMethod.identifier) {
    case 'email': {
      if (signInMethod.password && !signInMethod.verificationCode) {
        return <EmailPassword className={styles.main} />;
      }

      return <EmailPasswordless type="sign-in" className={styles.main} />;
    }

    case 'sms': {
      if (signInMethod.password && !signInMethod.verificationCode) {
        return <PhonePassword className={styles.main} />;
      }

      return <PhonePasswordless type="sign-in" className={styles.main} />;
    }

    case 'username': {
      return <UsernameSignIn className={styles.main} />;
    }

    default: {
      if (socialConnectors.length > 0) {
        return <SocialSignIn />;
      }

      return null;
    }
  }
};

export default Main;
