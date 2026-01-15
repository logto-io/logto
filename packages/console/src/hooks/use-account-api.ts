import { useLogto } from '@logto/react';
import ky from 'ky';
import { useMemo } from 'react';

import { requestTimeout, adminTenantEndpoint } from '@/consts';
import { isCloud } from '@/consts/env';

/**
 * Get the prefix URL for the Account API.
 *
 * - In Cloud, use the `/a/` proxy path to avoid cross-origin issues.
 * - In OSS, directly use the admin tenant endpoint.
 */
const getAccountApiPrefixUrl = (): URL => {
  if (isCloud) {
    return new URL('a', window.location.origin);
  }
  return new URL('api/my-account/', adminTenantEndpoint);
};

/**
 * A hook to get a Ky instance for calling the Account API (/api/my-account).
 * The Account API uses OIDC opaque access tokens (no resource indicator).
 *
 * In Cloud environment, requests are proxied through `/a/` to avoid cross-origin issues.
 * In OSS environment, requests go directly to the admin tenant endpoint.
 */
const useAccountApi = () => {
  const { isAuthenticated, getAccessToken } = useLogto();

  const api = useMemo(
    () =>
      ky.create({
        prefixUrl: getAccountApiPrefixUrl(),
        timeout: requestTimeout,
        hooks: {
          beforeRequest: [
            async (request) => {
              if (isAuthenticated) {
                const accessToken = await getAccessToken();
                request.headers.set('Authorization', `Bearer ${accessToken ?? ''}`);
              }
            },
          ],
        },
      }),
    [isAuthenticated, getAccessToken]
  );

  return api;
};

export default useAccountApi;
