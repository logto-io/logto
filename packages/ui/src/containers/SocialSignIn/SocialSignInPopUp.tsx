import React from 'react';

import Drawer from '@/components/Drawer';

import PrimarySocialSignIn from './PrimarySocialSignIn';

type Props = {
  isOpen?: boolean;
  onClose: () => void;
  className?: string;
};

const SocialSignInPopUp = ({ isOpen = false, onClose, className }: Props) => (
  <Drawer className={className} isOpen={isOpen} onClose={onClose}>
    <PrimarySocialSignIn isPopup onSocialSignInCallback={onClose} />
  </Drawer>
);

export default SocialSignInPopUp;
