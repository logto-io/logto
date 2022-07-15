import { useContext } from 'react';
import { create } from 'react-modal-promise';

import { IframeModal } from '@/components/ConfirmModal';
import { PageContext } from '@/hooks/use-page-context';

import { modalPromisify } from '../termsOfUseModalPromisify';

/**
 * For mobile use only, includes embedded Terms iframe
 */
type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const TermsOfUseIframeModal = ({ isOpen = false, onConfirm, onClose }: Props) => {
  const { setTermsAgreement, experienceSettings } = useContext(PageContext);
  const { termsOfUse } = experienceSettings ?? {};

  return (
    <IframeModal
      isOpen={isOpen}
      confirmText="action.agree"
      url={termsOfUse?.contentUrl ?? ''}
      onConfirm={() => {
        setTermsAgreement(true);
        onConfirm();
      }}
      onClose={onClose}
    />
  );
};

export default TermsOfUseIframeModal;

export const termsOfUseIframeModalPromise = create(modalPromisify(TermsOfUseIframeModal));
