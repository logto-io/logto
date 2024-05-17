import { conditional } from '@silverhand/essentials';
import { useCallback, useContext, useMemo } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import TermsAndPrivacyConfirmModalContent from '@/containers/TermsAndPrivacyConfirmModalContent';

import { useConfirmModal } from './use-confirm-modal';

const useTerms = () => {
  const { termsAgreement, setTermsAgreement, experienceSettings } = useContext(PageContext);
  const { show } = useConfirmModal();

  const { termsOfUseUrl, privacyPolicyUrl, isTermsDisabled } = useMemo(() => {
    const { termsOfUseUrl, privacyPolicyUrl } = experienceSettings ?? {};
    const isTermsDisabled = !termsOfUseUrl && !privacyPolicyUrl;

    return {
      termsOfUseUrl: conditional(termsOfUseUrl),
      privacyPolicyUrl: conditional(privacyPolicyUrl),
      isTermsDisabled,
    };
  }, [experienceSettings]);

  const termsAndPrivacyConfirmModalHandler = useCallback(async () => {
    const [result] = await show({
      ModalContent: TermsAndPrivacyConfirmModalContent,
      confirmText: 'action.agree',
    });

    // Update the local terms status
    if (result) {
      setTermsAgreement(true);
    }

    return result;
  }, [setTermsAgreement, show]);

  const termsValidation = useCallback(async () => {
    if (termsAgreement || isTermsDisabled) {
      return true;
    }

    return termsAndPrivacyConfirmModalHandler();
  }, [termsAgreement, isTermsDisabled, termsAndPrivacyConfirmModalHandler]);

  return {
    termsOfUseUrl,
    privacyPolicyUrl,
    termsAgreement,
    isTermsDisabled,
    termsValidation,
    setTermsAgreement,
    termsAndPrivacyConfirmModalHandler,
  };
};

export default useTerms;
