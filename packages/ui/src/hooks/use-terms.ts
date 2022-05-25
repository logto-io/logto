import { useContext, useCallback } from 'react';

import { termsOfUseModalPromise } from '@/containers/TermsOfUse/TermsOfUsePromiseModal';

import { PageContext } from './use-page-context';

const useTerms = () => {
  const { termsAgreement, setTermsAgreement, experienceSettings } = useContext(PageContext);

  const { termsOfUse } = experienceSettings ?? {};

  const termsOfUserModalHandler = useCallback(async () => {
    try {
      await termsOfUseModalPromise();

      return true;
    } catch {
      return false;
    }
  }, []);

  const termsValidation = useCallback(async () => {
    if (termsAgreement || !termsOfUse?.enabled || !termsOfUse.contentUrl) {
      return true;
    }

    return termsOfUserModalHandler();
  }, [termsAgreement, termsOfUse, termsOfUserModalHandler]);

  return {
    termsSettings: termsOfUse,
    termsAgreement,
    termsValidation,
    setTermsAgreement,
    termsOfUserModalHandler,
  };
};

export default useTerms;
