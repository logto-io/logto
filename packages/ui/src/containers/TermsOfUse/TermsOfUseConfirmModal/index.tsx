import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import reactStringReplace from 'react-string-replace';

import { WebModal, MobileModal } from '@/components/ConfirmModal';
import TextLink from '@/components/TextLink';
import usePlatform from '@/hooks/use-platform';

type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  termsUrl: string;
};

const TermsOfUseConfirmModal = ({ isOpen = false, termsUrl, onConfirm, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { isMobile } = usePlatform();
  const ConfirmModal = isMobile ? MobileModal : WebModal;

  const terms = t('description.terms_of_use');
  const content = t('description.agree_with_terms_modal', { terms });

  const modalContent: ReactNode = reactStringReplace(content, terms, () => (
    <TextLink key={terms} text="description.terms_of_use" href={termsUrl} target="_blank" />
  ));

  return (
    <ConfirmModal isOpen={isOpen} onConfirm={onConfirm} onClose={onClose}>
      {modalContent}
    </ConfirmModal>
  );
};

export default TermsOfUseConfirmModal;
