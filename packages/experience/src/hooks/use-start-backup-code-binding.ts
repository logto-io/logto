import { MfaFactor, VerificationType } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { createBackupCode } from '@/apis/experience';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { UserMfaFlow } from '@/types';
import { type BackupCodeBindingState } from '@/types/guard';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';

const useStartBackupCodeBinding = () => {
  const navigate = useNavigateWithPreservedSearchParams();
  const generateBackUpCodes = useApi(createBackupCode);
  const { setVerificationId } = useContext(UserInteractionContext);

  const handleError = useErrorHandler();

  return useCallback(
    async (replace?: boolean) => {
      const [error, result] = await generateBackUpCodes();

      if (error) {
        await handleError(error);
        return;
      }

      if (!result) {
        return;
      }

      const { verificationId, codes } = result;
      setVerificationId(VerificationType.BackupCode, verificationId);

      navigate(
        { pathname: `/${UserMfaFlow.MfaBinding}/${MfaFactor.BackupCode}` },
        { replace, state: { codes } satisfies BackupCodeBindingState }
      );
    },
    [generateBackUpCodes, handleError, navigate, setVerificationId]
  );
};

export default useStartBackupCodeBinding;
