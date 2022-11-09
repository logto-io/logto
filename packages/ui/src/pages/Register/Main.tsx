import type { SignInIdentifier, ConnectorMetadata } from '@logto/schemas';

import { EmailRegister } from '@/containers/EmailForm';
import { SmsRegister } from '@/containers/PhoneForm';
import SocialSignIn from '@/containers/SocialSignIn';
import { UsernameRegister } from '@/containers/UsernameForm';

import * as styles from './index.module.scss';

type Props = {
  signUpMethod?: SignInIdentifier;
  socialConnectors: ConnectorMetadata[];
};

const Main = ({ signUpMethod, socialConnectors }: Props) => {
  switch (signUpMethod) {
    case 'email':
      return <EmailRegister className={styles.main} />;

    case 'sms':
      return <SmsRegister className={styles.main} />;

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
