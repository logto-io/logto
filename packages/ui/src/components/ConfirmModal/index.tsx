import React from 'react';
import { isMobile } from 'react-device-detect';

import AcModal from './AcModal';
import MobileModal from './MobileModal';
import { ModalProps } from './type';

const ConfirmModal = (props: ModalProps) => {
  return isMobile ? <MobileModal {...props} /> : <AcModal {...props} />;
};

export default ConfirmModal;
