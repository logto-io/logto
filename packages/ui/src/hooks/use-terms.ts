import { useContext, useCallback } from 'react';

import { termsOfUseModalPromise } from '@/containers/TermsOfUse/TermsOfUsePromiseModal';

import { PageContext } from './use-page-context';

const useTerms = () => {
  const { termsAgreement, setTermsAgreement, experienceSettings } = useContext(PageContext);

  const { termsOfUse } = experienceSettings ?? {};

  const termsValidation = useCallback(async () => {
    if (termsAgreement || !termsOfUse?.enabled || !termsOfUse.contentUrl) {
      return true;
    }

    try {
      await termsOfUseModalPromise();

      return true;
    } catch {
      return false;
    }
  }, [termsAgreement, termsOfUse]);

  return {
    termsSettings: termsOfUse,
    termsAgreement,
    termsValidation,
    setTermsAgreement,
  };
};

export default useTerms;
