import { useLogto } from '@logto/react';
import { AdminConsoleConfig, Setting } from '@logto/schemas';
import useSWR from 'swr';

import useApi, { RequestError } from './use-api';

const useAdminConsoleConfigs = () => {
  const { isAuthenticated, error: authError } = useLogto();
  const {
    data: settings,
    error,
    mutate,
  } = useSWR<Setting, RequestError>(isAuthenticated && !authError && '/api/settings');
  const api = useApi();

  const updateConfigs = async (delta: Partial<AdminConsoleConfig>) => {
    const updatedSettings = await api
      .patch('/api/settings', {
        json: {
          adminConsole: {
            ...delta,
          },
        },
      })
      .json<Setting>();
    void mutate(updatedSettings);
  };

  return {
    configs: settings?.adminConsole,
    error,
    updateConfigs,
  };
};

export default useAdminConsoleConfigs;
