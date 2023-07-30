import type { SignIn } from '@logto/schemas';

import ConnectorSignInList, {
  type ConnectorMetadataWithId,
} from '@/containers/ConnectorSignInList';

import IdentifierSignInForm from './IdentifierSignInForm';
import PasswordSignInForm from './PasswordSignInForm';
import * as styles from './index.module.scss';

type Props = {
  signInMethods: SignIn['methods'];
  connectors: ConnectorMetadataWithId[];
};

const Main = ({ signInMethods, connectors }: Props) => {
  if (signInMethods.length === 0 && connectors.length > 0) {
    return <ConnectorSignInList className={styles.main} connectors={connectors} />;
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
