import React from 'react';

import Drawer from '@/components/Drawer';

import SocialSignInList from '../SocialSignInList';

type Props = {
  isOpen?: boolean;
  onClose: () => void;
  className?: string;
};

const SocialSignInPopUp = ({ isOpen = false, onClose, className }: Props) => (
  <Drawer className={className} isOpen={isOpen} onClose={onClose}>
    <SocialSignInList isCollapseEnabled={false} onSocialSignInCallback={onClose} />
  </Drawer>
);

export default SocialSignInPopUp;
