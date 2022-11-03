import { SignInIdentifier } from '@logto/schemas';
import type { SignIn as SignInType, ConnectorMetadata } from '@logto/schemas';

import { EmailSignIn } from '@/containers/EmailForm';
import EmailPassword from '@/containers/EmailPassword';
import { SmsSignIn } from '@/containers/PhoneForm';
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
  switch (signInMethod?.identifier) {
    case SignInIdentifier.Email: {
      if (signInMethod.password && !signInMethod.verificationCode) {
        return <EmailPassword className={styles.main} />;
      }

      return <EmailSignIn signInMethod={signInMethod} className={styles.main} />;
    }

    case SignInIdentifier.Sms: {
      if (signInMethod.password && !signInMethod.verificationCode) {
        return <PhonePassword className={styles.main} />;
      }

      return <SmsSignIn signInMethod={signInMethod} className={styles.main} />;
    }

    case SignInIdentifier.Username: {
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
