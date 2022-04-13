import { ConnectorMetadata } from '@logto/schemas';
import React from 'react';

import Drawer from '@/components/Drawer';

import PrimarySocialSignIn from './PrimarySocialSignIn';

type Props = {
  isOpen?: boolean;
  onClose: () => void;
  className: string;
  connectors: Array<Pick<ConnectorMetadata, 'id' | 'logo' | 'name'>>;
};

const SocialSignInPopUp = ({ isOpen = false, onClose, className, connectors }: Props) => {
  <Drawer className={className} isOpen={isOpen} onClose={onClose}>
    <PrimarySocialSignIn isPopup connectors={connectors} />
  </Drawer>;
};

export default SocialSignInPopUp;
