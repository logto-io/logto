import { ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'react-modal-promise';
import reactStringReplace from 'react-string-replace';

import { WebModal, MobileModal } from '@/components/ConfirmModal';
import TextLink from '@/components/TextLink';
import { PageContext } from '@/hooks/use-page-context';
import usePlatform from '@/hooks/use-platform';
import { TermsOfUseModalMessage } from '@/types';

import { modalPromisify } from '../termsOfUseModalPromisify';

/**
 * For web use only confirm modal, does not contain Terms iframe
 */

type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: (message?: TermsOfUseModalMessage) => void;
};

const TermsOfUseConfirmModal = ({ isOpen = false, onConfirm, onClose }: Props) => {
  const { t } = useTranslation();
  const { isMobile } = usePlatform();
  const { setTermsAgreement, experienceSettings } = useContext(PageContext);
  const { termsOfUse } = experienceSettings ?? {};

  const ConfirmModal = isMobile ? MobileModal : WebModal;

  const terms = t('description.terms_of_use');
  const content = t('description.agree_with_terms_modal', { terms });

  const linkProps = isMobile
    ? {
        onClick: () => {
          onClose(TermsOfUseModalMessage.SHOW_DETAIL_MODAL);
        },
      }
    : {
        href: termsOfUse?.contentUrl,
        target: '_blank',
      };

  const modalContent: ReactNode = reactStringReplace(content, terms, () => (
    <TextLink key={terms} text="description.terms_of_use" {...linkProps} />
  ));

  return (
    <ConfirmModal
      isOpen={isOpen}
      confirmText="action.agree"
      onConfirm={() => {
        setTermsAgreement(true);
        onConfirm();
      }}
      onClose={onClose}
    >
      {modalContent}
    </ConfirmModal>
  );
};

export default TermsOfUseConfirmModal;

export const termsOfUseConfirmModalPromise = create(modalPromisify(TermsOfUseConfirmModal));
