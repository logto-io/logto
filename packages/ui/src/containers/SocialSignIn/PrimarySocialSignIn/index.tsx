import useNativeMessageListener from '@/hooks/use-native-message-listener';
import useSocial from '@/hooks/use-social';

import SocialSignInList from '../SocialSignInList';

export const defaultSize = 3;

type Props = {
  className?: string;
};

const PrimarySocialSignIn = ({ className }: Props) => {
  const { socialConnectors } = useSocial();
  useNativeMessageListener();

  return <SocialSignInList className={className} socialConnectors={socialConnectors} />;
};

export default PrimarySocialSignIn;
