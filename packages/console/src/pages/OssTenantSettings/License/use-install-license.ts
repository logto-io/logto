import { type RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useCallback, useContext, useState } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import useApi from '@/hooks/use-api';

import { isLicenseInstallErrorCode } from './utils';

/**
 * Install a license key on this deployment.
 *
 * A key the deployment refuses (a tampered one, or one that expired before it was ever installed)
 * is a problem with what was pasted, so its message is returned for the form to show next to the
 * field. Every other failure keeps the global error handling.
 */
const useInstallLicense = () => {
  // The two key errors are answered on the form, so they must not also raise a toast.
  const api = useApi({ hideErrorToast: ['license.invalid_key', 'license.expired_key'] });
  const { mutateLicense } = useContext(SubscriptionDataContext);
  const [errorMessage, setErrorMessage] = useState<string>();

  const clearError = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  const installLicense = useCallback(
    async (license: string) => {
      setErrorMessage(undefined);

      try {
        await api.put('api/systems/license', { json: { license } });
      } catch (error: unknown) {
        if (!(error instanceof HTTPError)) {
          throw error;
        }

        const { code, message } = await error.response.clone().json<RequestErrorBody>();

        if (!isLicenseInstallErrorCode(code)) {
          throw error;
        }

        setErrorMessage(message);

        return false;
      }

      mutateLicense();

      return true;
    },
    [api, mutateLicense]
  );

  return { installLicense, errorMessage, clearError };
};

export default useInstallLicense;
