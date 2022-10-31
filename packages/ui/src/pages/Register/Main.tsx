import type { SignInIdentifier, ConnectorMetadata } from '@logto/schemas';

import { EmailPasswordless, PhonePasswordless } from '@/containers/Passwordless';
import SocialSignIn from '@/containers/SocialSignIn';
import UsernameRegister from '@/containers/UsernameRegister';

import * as styles from './index.module.scss';

type Props = {
  signUpMethod?: SignInIdentifier;
  socialConnectors: ConnectorMetadata[];
};

const Main = ({ signUpMethod, socialConnectors }: Props) => {
  switch (signUpMethod) {
    case 'email':
      return <EmailPasswordless type="register" className={styles.main} />;

    case 'sms':
      return <PhonePasswordless type="register" className={styles.main} />;

    case 'username':
      return <UsernameRegister className={styles.main} />;

    default: {
      if (socialConnectors.length > 0) {
        return <SocialSignIn />;
      }

      return null;
    }
  }
};

export default Main;
