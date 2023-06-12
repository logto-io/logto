import type router from '@logto/cloud/routes';
import { type RouterRoutes } from '@withtyped/client';
import useSWR from 'swr';

import { useCloudApi } from './use-cloud-api';

type GetRoutes = RouterRoutes<typeof router>['get'];

const normalizeError = (error: unknown) => {
  if (error === undefined || error === null) {
    return;
  }

  return error instanceof Error ? error : new Error(String(error));
};

export const useCloudSwr = <Key extends keyof GetRoutes>(key: Key) => {
  const cloudApi = useCloudApi();
  const response = useSWR(key, async () => cloudApi.get(key));

  // By default, `useSWR()` uses `any` for the error type which is unexpected under our lint rule set.
  return { ...response, error: normalizeError(response.error) };
};
