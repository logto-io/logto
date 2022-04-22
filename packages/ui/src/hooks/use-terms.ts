import { useContext, useCallback } from 'react';

import { PageContext } from './use-page-context';

const useTerms = () => {
  const {
    termsAgreement,
    setTermsAgreement,
    showTermsModal,
    setShowTermsModal,
    experienceSettings,
  } = useContext(PageContext);

  const termsValidation = useCallback(() => {
    if (termsAgreement) {
      return;
    }

    setShowTermsModal(true);
  }, [setShowTermsModal, termsAgreement]);

  return {
    termsSettings: experienceSettings?.termsOfUse,
    termsAgreement,
    showTermsModal,
    termsValidation,
    setTermsAgreement,
    setShowTermsModal,
  };
};

export default useTerms;
