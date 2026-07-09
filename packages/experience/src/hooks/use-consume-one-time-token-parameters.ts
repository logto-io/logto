import { ExtraParamsKey } from '@logto/schemas';
import { useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import useLoginHint from '@/hooks/use-login-hint';
import { removeSearchParameters } from '@/shared/utils/search-parameters';

const oneTimeTokenSearchParameterKeys = Object.freeze([
  ExtraParamsKey.OneTimeToken,
  ExtraParamsKey.LoginHint,
] as const);

const useConsumeOneTimeTokenParameters = () => {
  const [params] = useSearchParams();
  const oneTimeToken = params.get(ExtraParamsKey.OneTimeToken);
  const loginHint = useLoginHint();

  useLayoutEffect(() => {
    removeSearchParameters(oneTimeTokenSearchParameterKeys);
  }, [params]);

  return {
    oneTimeToken,
    loginHint,
  };
};

export default useConsumeOneTimeTokenParameters;
