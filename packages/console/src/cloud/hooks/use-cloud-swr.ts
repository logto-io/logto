import useSWR from 'swr';

import { type GetRoutes } from '../types/router';

import { useCloudApi } from './use-cloud-api';

const normalizeError = (error: unknown) => {
  if (error === undefined || error === null) {
    return;
  }

  return error instanceof Error ? error : new Error(String(error));
};

/**
 * Note: Exclude `/api/services/mails/usage` because it requires a payload.
 * Todo: @xiaoyijun Support non-empty payload routes requests for `useCloudSwr` hook (LOG-6513)
 */
type EmptyPayloadGetRoutesKey = Exclude<keyof GetRoutes, '/api/services/mails/usage'>;

export const useCloudSwr = <Key extends EmptyPayloadGetRoutesKey>(key: Key) => {
  const cloudApi = useCloudApi();
  const response = useSWR(key, async () => cloudApi.get(key));

  // By default, `useSWR()` uses `any` for the error type which is unexpected under our lint rule set.
  return { ...response, error: normalizeError(response.error) };
};
