import type { SignIn, ConnectorMetadata } from '@logto/schemas';

import SocialSignIn from '@/containers/SocialSignIn';

import IdentifierSignInForm from './IdentifierSignInForm';
import PasswordSignInForm from './PasswordSignInForm';
import * as styles from './index.module.scss';

type Props = {
  signInMethods: SignIn['methods'];
  socialConnectors: ConnectorMetadata[];
};

const Main = ({ signInMethods, socialConnectors }: Props) => {
  if (signInMethods.length === 0 && socialConnectors.length > 0) {
    return <SocialSignIn className={styles.main} />;
  }

  const isPasswordOnly =
    signInMethods.length > 0 &&
    signInMethods.every(({ password, verificationCode }) => password && !verificationCode);

  if (isPasswordOnly) {
    return (
      <PasswordSignInForm
        className={styles.main}
        signInMethods={signInMethods.map(({ identifier }) => identifier)}
      />
    );
  }

  if (signInMethods.length > 0) {
    return <IdentifierSignInForm className={styles.main} signInMethods={signInMethods} />;
  }

  return null;
};

export default Main;
