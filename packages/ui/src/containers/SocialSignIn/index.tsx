import type { ConnectorMetadata } from '@logto/schemas';

import TermsOfUse from '@/containers/TermsOfUse';

import SocialSignInList from './SocialSignInList';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  socialConnectors: ConnectorMetadata[];
};

const SocialSignIn = ({ className, socialConnectors }: Props) => {
  return (
    <>
      <TermsOfUse className={styles.terms} />
      <SocialSignInList className={className} socialConnectors={socialConnectors} />
    </>
  );
};

export default SocialSignIn;

export { default as SocialSignInList } from './SocialSignInList';
