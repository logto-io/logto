import { type BindTotpPayload } from '@logto/schemas';
import { useCallback } from 'react';

import { bindMfa } from '@/apis/interaction';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';

// Todo: @xiaoyijun maybe `useVerifyTotp` later
const useBindTotp = () => {
  const asyncBindTotp = useApi(bindMfa);
  const handleError = useErrorHandler();
  /**
   * Todo: @xiaoyijun
   * - Handle Error message displayed in the UI
   * - Handle continue sign-in errors
   */

  return useCallback(
    async (payload: BindTotpPayload) => {
      const [error, result] = await asyncBindTotp(payload);
      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncBindTotp, handleError]
  );
};

export default useBindTotp;
