import type { SignIn, ConnectorMetadata } from '@logto/schemas';

import BlockchainSignInList from '@/containers/BlockchainSignInList';
import SocialSignInList from '@/containers/SocialSignInList';

import IdentifierSignInForm from './IdentifierSignInForm';
import PasswordSignInForm from './PasswordSignInForm';
import * as styles from './index.module.scss';

type Props = {
  signInMethods: SignIn['methods'];
  socialConnectors: ConnectorMetadata[];
  blockchainConnectors: ConnectorMetadata[];
};

const Main = ({ signInMethods, socialConnectors, blockchainConnectors }: Props) => {
  if (signInMethods.length === 0 && blockchainConnectors.length > 0) {
    return (
      <BlockchainSignInList className={styles.main} blockchainConnectors={blockchainConnectors} />
    );
  }

  if (signInMethods.length === 0 && socialConnectors.length > 0) {
    return <SocialSignInList className={styles.main} socialConnectors={socialConnectors} />;
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
