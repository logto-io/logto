import React, { useContext } from 'react';
import { create, InstanceProps } from 'react-modal-promise';

import { PageContext } from '@/hooks/use-page-context';
import usePlatform from '@/hooks/use-platform';

import TermsOfUseConfirmModal from '../TermsOfUseConfirmModal';
import TermsOfUseIframeModal from '../TermsOfUseIframeModal';

const TermsOfUsePromiseModal = ({ isOpen, onResolve, onReject }: InstanceProps<boolean>) => {
  const { setTermsAgreement, experienceSettings } = useContext(PageContext);
  const { termsOfUse } = experienceSettings ?? {};
  const { isMobile } = usePlatform();

  const ConfirmModal = isMobile ? TermsOfUseIframeModal : TermsOfUseConfirmModal;

  return (
    <ConfirmModal
      isOpen={isOpen}
      termsUrl={termsOfUse?.contentUrl ?? ''}
      onConfirm={() => {
        setTermsAgreement(true);
        onResolve(true);
      }}
      onClose={() => {
        onReject(false);
      }}
    />
  );
};

export default TermsOfUsePromiseModal;

export const termsOfUseModalPromise = create(TermsOfUsePromiseModal);
