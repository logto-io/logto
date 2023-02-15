import TermsOfUse from '@/containers/TermsOfUse';
import useSocial from '@/hooks/use-social';

import SocialSignInList from './SocialSignInList';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

const SocialSignIn = ({ className }: Props) => {
  const { socialConnectors } = useSocial();

  return (
    <>
      <TermsOfUse className={styles.terms} />
      <SocialSignInList className={className} socialConnectors={socialConnectors} />
    </>
  );
};

export default SocialSignIn;

export { default as SocialSignInList } from './SocialSignInList';
