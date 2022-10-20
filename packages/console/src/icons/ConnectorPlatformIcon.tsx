import { ConnectorPlatform } from '@logto/schemas';

import Native from '@/assets/images/connector-platform-icon-native.svg';
import Universal from '@/assets/images/connector-platform-icon-universal.svg';
import Web from '@/assets/images/connector-platform-icon-web.svg';

type Props = {
  platform: ConnectorPlatform;
};

const ConnectorPlatformIcon = ({ platform }: Props) => {
  if (platform === ConnectorPlatform.Native) {
    return <Native />;
  }

  if (platform === ConnectorPlatform.Web) {
    return <Web />;
  }

  return <Universal />;
};

export default ConnectorPlatformIcon;
