import React from 'react';

import usePlatform from '@/hooks/use-platform';

import AcModal from './AcModal';
import MobileModal from './MobileModal';
import { ModalProps } from './type';

const ConfirmModal = (props: ModalProps) => {
  const { isMobile } = usePlatform();

  return isMobile ? <MobileModal {...props} /> : <AcModal {...props} />;
};

export default ConfirmModal;
