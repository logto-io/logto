import { useContext, useCallback } from 'react';

import { createIframeConfirmModalContent } from '@/containers/TermsOfUse/IframeConfirmModalContent';
import TermsOfUseConfirmModalContent from '@/containers/TermsOfUse/TermsOfUseConfirmModalContent';
import { ConfirmModalMessage } from '@/types';

import * as styles from '../components/ConfirmModal/MobileModal.module.scss';
import { useConfirmModal } from './use-confirm-modal';
import { PageContext } from './use-page-context';

const useTerms = () => {
  const { termsAgreement, setTermsAgreement, experienceSettings } = useContext(PageContext);
  const { show } = useConfirmModal();

  const { termsOfUseUrl } = experienceSettings ?? {};

  const termsOfUseIframeModalHandler = useCallback(async () => {
    const [result] = await show({
      className: styles.iframeModal,
      ModalContent: () => createIframeConfirmModalContent(termsOfUseUrl ?? undefined),
      confirmText: 'action.agree',
    });

    // Update the local terms status
    if (result) {
      setTermsAgreement(true);
    }

    return result;
  }, [setTermsAgreement, show, termsOfUseUrl]);

  const termsOfUseConfirmModalHandler = useCallback(async () => {
    const [result, data] = await show({
      ModalContent: TermsOfUseConfirmModalContent,
      confirmText: 'action.agree',
    });

    // Show Terms Detail Confirm Modal
    if (data === ConfirmModalMessage.SHOW_TERMS_DETAIL_MODAL) {
      const detailResult = await termsOfUseIframeModalHandler();

      return detailResult;
    }

    // Update the local terms status
    if (result) {
      setTermsAgreement(true);
    }

    return result;
  }, [setTermsAgreement, show, termsOfUseIframeModalHandler]);

  const termsValidation = useCallback(async () => {
    if (termsAgreement || !termsOfUseUrl) {
      return true;
    }

    return termsOfUseConfirmModalHandler();
  }, [termsAgreement, termsOfUseUrl, termsOfUseConfirmModalHandler]);

  return {
    termsOfUseUrl,
    termsAgreement,
    termsValidation,
    setTermsAgreement,
    termsOfUseConfirmModalHandler,
    termsOfUseIframeModalHandler,
  };
};

export default useTerms;
