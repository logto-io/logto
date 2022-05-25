import React, { useContext } from 'react';
import { create, InstanceProps } from 'react-modal-promise';

import { PageContext } from '@/hooks/use-page-context';

import TermsOfUseConfirmModal from '../TermsOfUseConfirmModal';

const TermsOfUsePromiseModal = ({ isOpen, onResolve, onReject }: InstanceProps<boolean>) => {
  const { setTermsAgreement, experienceSettings } = useContext(PageContext);
  const { termsOfUse } = experienceSettings ?? {};

  return (
    <TermsOfUseConfirmModal
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
