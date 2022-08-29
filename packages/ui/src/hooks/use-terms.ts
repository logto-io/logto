import { useContext, useCallback } from 'react';

import { termsOfUseConfirmModalPromise } from '@/containers/TermsOfUse/TermsOfUseConfirmModal';
import { termsOfUseIframeModalPromise } from '@/containers/TermsOfUse/TermsOfUseIframeModal';
import { TermsOfUseModalMessage } from '@/types';

import { PageContext } from './use-page-context';

const useTerms = () => {
  const { termsAgreement, setTermsAgreement, experienceSettings } = useContext(PageContext);

  const { termsOfUse } = experienceSettings ?? {};

  const termsOfUseIframeModalHandler = useCallback(async () => {
    try {
      await termsOfUseIframeModalPromise();

      return true;
    } catch {
      return false;
    }
  }, []);

  const termsOfUseConfirmModalHandler = useCallback(async () => {
    try {
      await termsOfUseConfirmModalPromise();

      return true;
    } catch (error: unknown) {
      if (error === TermsOfUseModalMessage.SHOW_DETAIL_MODAL) {
        const result = await termsOfUseIframeModalHandler();

        return result;
      }

      return false;
    }
  }, [termsOfUseIframeModalHandler]);

  const termsValidation = useCallback(async () => {
    if (termsAgreement || !termsOfUse?.enabled || !termsOfUse.contentUrl) {
      return true;
    }

    return termsOfUseConfirmModalHandler();
  }, [termsAgreement, termsOfUse, termsOfUseConfirmModalHandler]);

  return {
    termsSettings: termsOfUse,
    termsAgreement,
    termsValidation,
    setTermsAgreement,
    termsOfUseConfirmModalHandler,
    termsOfUseIframeModalHandler,
  };
};

export default useTerms;
