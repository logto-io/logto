import React from 'react';

import { IframeModal } from '@/components/ConfirmModal';

/**
 * For mobile use only, includes embedded Terms iframe
 */
type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  termsUrl: string;
};

const TermsOfUseIframeModal = ({ isOpen = false, termsUrl, onConfirm, onClose }: Props) => {
  return (
    <IframeModal
      isOpen={isOpen}
      confirmText="action.agree"
      url={termsUrl}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};

export default TermsOfUseIframeModal;
