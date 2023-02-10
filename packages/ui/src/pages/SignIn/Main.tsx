import type { ConnectorMetadata, SignInExperience } from '@logto/schemas';

import SocialSignIn from '@/containers/SocialSignIn';

import PasswordSignInForm from './PasswordSignInForm';
import * as styles from './index.module.scss';

type Props = {
  signInMethods: SignInExperience['signIn']['methods'];
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
    // TODO: password or validation code signIn
    return <div>Working In Progress</div>;
  }

  return null;
};

export default Main;
