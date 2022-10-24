import { useLogto } from '@logto/react';
import type { AdminConsoleConfig, Setting } from '@logto/schemas';
import useSWR from 'swr';

import type { RequestError } from './use-api';
import useApi from './use-api';

const useSettings = () => {
  const { isAuthenticated, error: authError } = useLogto();
  const shouldFetch = isAuthenticated && !authError;
  const {
    data: settings,
    error,
    mutate,
  } = useSWR<Setting, RequestError>(shouldFetch && '/api/settings');
  const api = useApi();

  const updateSettings = async (delta: Partial<AdminConsoleConfig>) => {
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
    isLoading: !settings && !error,
    settings: settings?.adminConsole,
    error,
    mutate,
    updateSettings,
  };
};

export default useSettings;
