import { ConnectorPlatform } from '@logto/schemas';

import Native from '@/assets/icons/connector-platform-icon-native.svg';
import Universal from '@/assets/icons/connector-platform-icon-universal.svg';
import Web from '@/assets/icons/connector-platform-icon-web.svg';

type Props = {
  readonly platform: ConnectorPlatform;
};

function ConnectorPlatformIcon({ platform }: Props) {
  if (platform === ConnectorPlatform.Native) {
    return <Native />;
  }

  if (platform === ConnectorPlatform.Web) {
    return <Web />;
  }

  return <Universal />;
}

export default ConnectorPlatformIcon;
