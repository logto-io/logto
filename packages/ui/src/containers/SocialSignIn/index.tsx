import type { ConnectorMetadata } from '@logto/schemas';

import TermsAndPrivacy from '@/containers/TermsAndPrivacy';

import SocialSignInList from './SocialSignInList';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  socialConnectors: ConnectorMetadata[];
};

const SocialSignIn = ({ className, socialConnectors }: Props) => {
  return (
    <>
      <TermsAndPrivacy className={styles.terms} />
      <SocialSignInList className={className} socialConnectors={socialConnectors} />
    </>
  );
};

export default SocialSignIn;

export { default as SocialSignInList } from './SocialSignInList';
