import { conditional } from '@silverhand/essentials';
import { useContext, useCallback, useMemo } from 'react';

import TermsOfUseConfirmModalContent from '@/containers/TermsOfUse/TermsOfUseConfirmModalContent';

import { useConfirmModal } from './use-confirm-modal';
import { PageContext } from './use-page-context';

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

  const termsOfUseConfirmModalHandler = useCallback(async () => {
    const [result] = await show({
      ModalContent: TermsOfUseConfirmModalContent,
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

    return termsOfUseConfirmModalHandler();
  }, [termsAgreement, isTermsDisabled, termsOfUseConfirmModalHandler]);

  return {
    termsOfUseUrl,
    privacyPolicyUrl,
    termsAgreement,
    isTermsDisabled,
    termsValidation,
    setTermsAgreement,
    termsOfUseConfirmModalHandler,
  };
};

export default useTerms;
