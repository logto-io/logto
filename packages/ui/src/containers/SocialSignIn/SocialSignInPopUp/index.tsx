import type { ConnectorMetadata } from '@logto/schemas';

import Drawer from '@/components/Drawer';

import SocialSignInList from '../SocialSignInList';

type Props = {
  connectors?: ConnectorMetadata[];
  className?: string;
  isOpen?: boolean;
  onClose: () => void;
};

const SocialSignInPopUp = ({ connectors = [], isOpen = false, onClose, className }: Props) => (
  <Drawer className={className} isOpen={isOpen} onClose={onClose}>
    <SocialSignInList
      isCollapseEnabled={false}
      socialConnectors={connectors}
      onSocialSignInCallback={onClose}
    />
  </Drawer>
);

export default SocialSignInPopUp;
