import Drawer from '@/components/Drawer';
import { ConnectorData } from '@/types';

import SocialSignInList from '../SocialSignInList';

type Props = {
  connectors?: ConnectorData[];
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
