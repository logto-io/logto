import { useCallback } from 'react';

import { linkWithSocial } from '@/apis/interaction';
import useApi from '@/hooks/use-api';

import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';

const useLinkSocial = () => {
  const handleError = useErrorHandler();
  const asyncLinkWithSocial = useApi(linkWithSocial);
  const redirectTo = useGlobalRedirectTo();

  return useCallback(
    async (connectorId: string) => {
      const [error, result] = await asyncLinkWithSocial(connectorId);

      if (error) {
        await handleError(error);

        return;
      }

      if (result?.redirectTo) {
        redirectTo(result.redirectTo);
      }
    },
    [asyncLinkWithSocial, handleError, redirectTo]
  );
};

export default useLinkSocial;
