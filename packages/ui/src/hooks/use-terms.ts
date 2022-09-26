import { useContext, useCallback } from 'react';

import { termsOfUseConfirmModalPromise } from '@/containers/TermsOfUse/TermsOfUseConfirmModal';
import { termsOfUseIframeModalPromise } from '@/containers/TermsOfUse/TermsOfUseIframeModal';
import { ConfirmModalMessage } from '@/types';
import { flattenPromiseResult } from '@/utils/promisify';

import { PageContext } from './use-page-context';

const useTerms = () => {
  const { termsAgreement, setTermsAgreement, experienceSettings } = useContext(PageContext);

  const { termsOfUse } = experienceSettings ?? {};

  const termsOfUseIframeModalHandler = useCallback(async () => {
    const [result] = await flattenPromiseResult<boolean>(termsOfUseIframeModalPromise());

    return Boolean(result);
  }, []);

  const termsOfUseConfirmModalHandler = useCallback(async () => {
    const [result, error] = await flattenPromiseResult<boolean>(termsOfUseConfirmModalPromise());

    if (error === ConfirmModalMessage.SHOW_TERMS_DETAIL_MODAL) {
      const result = await termsOfUseIframeModalHandler();

      return result;
    }

    return Boolean(result);
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
