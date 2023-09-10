import { useCallback } from 'react';

import { linkWithSocial } from '@/apis/interaction';
import useApi from '@/hooks/use-api';

import useErrorHandler from './use-error-handler';

const useLinkSocial = () => {
  const handleError = useErrorHandler();
  const asyncLinkWithSocial = useApi(linkWithSocial);

  return useCallback(
    async (connectorId: string) => {
      const [error, result] = await asyncLinkWithSocial(connectorId);

      if (error) {
        await handleError(error);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncLinkWithSocial, handleError]
  );
};

export default useLinkSocial;
