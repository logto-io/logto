import {
  type GuardedResponse,
  type GuardedPayload,
  type EmptyPayloadRoutes,
} from '@withtyped/client';
import useSWR, { type SWRResponse } from 'swr';

import { type GetRoutes } from '../types/router';

import { useCloudApi } from './use-cloud-api';

const normalizeError = (error: unknown) => {
  if (error === undefined || error === null) {
    return;
  }

  return error instanceof Error ? error : new Error(String(error));
};

// The function type signature is mimicked from `ClientRequestHandler`
// in `@withtyped/client` since TypeScript cannot reuse generic type
// alias.
export const useCloudSwr = <T extends keyof GetRoutes>(
  ...args: T extends EmptyPayloadRoutes<GetRoutes>
    ? [path: T]
    : [path: T, payload: GuardedPayload<GetRoutes[T]>]
): SWRResponse<GuardedResponse<GetRoutes[T]>, Error> => {
  const cloudApi = useCloudApi();
  const response = useSWR<GuardedResponse<GetRoutes[T]>>(args[0], async () =>
    cloudApi.get(...args)
  );

  // By default, `useSWR()` uses `any` for the error type which is unexpected under our lint rule set.
  return { ...response, error: normalizeError(response.error) };
};
