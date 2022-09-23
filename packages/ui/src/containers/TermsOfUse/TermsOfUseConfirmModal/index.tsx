import { useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { create } from 'react-modal-promise';

import { WebModal, MobileModal, modalPromisify } from '@/components/ConfirmModal';
import TextLink from '@/components/TextLink';
import { PageContext } from '@/hooks/use-page-context';
import usePlatform from '@/hooks/use-platform';
import { ConfirmModalMessage } from '@/types';

/**
 * For web use only confirm modal, does not contain Terms iframe
 */

type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: (message?: ConfirmModalMessage) => void;
};

const TermsOfUseConfirmModal = ({ isOpen = false, onConfirm, onClose }: Props) => {
  const { t } = useTranslation();
  const { isMobile } = usePlatform();
  const { setTermsAgreement, experienceSettings } = useContext(PageContext);
  const { termsOfUse } = experienceSettings ?? {};

  const ConfirmModal = isMobile ? MobileModal : WebModal;

  const terms = t('description.terms_of_use');

  const linkProps = isMobile
    ? {
        onClick: () => {
          onClose(ConfirmModalMessage.SHOW_TERMS_DETAIL_MODAL);
        },
      }
    : {
        href: termsOfUse?.contentUrl,
        target: '_blank',
      };

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
      <Trans
        components={{
          link: <TextLink key={terms} text="description.terms_of_use" {...linkProps} />,
        }}
      >
        {t('description.agree_with_terms_modal')}
      </Trans>
    </ConfirmModal>
  );
};

export default TermsOfUseConfirmModal;

export const termsOfUseConfirmModalPromise = create(modalPromisify(TermsOfUseConfirmModal));
