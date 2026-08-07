import path from 'node:path';

import {
  type ProtectedAppConfigProviderData,
  type RegionLookupKvProviderData,
} from '@logto/schemas';
import { got } from 'got';

import RequestError from '#src/errors/RequestError/index.js';

import { baseUrl } from './consts.js';
import { type SiteConfigs } from './types.js';
import { buildHandleResponse } from './utils.js';

const handleResponse = buildHandleResponse(() => {
  throw new RequestError({
    code: 'application.cloudflare_unknown_error',
    status: 500,
  });
});

export const updateProtectedAppSiteConfigs = async (
  auth: ProtectedAppConfigProviderData,
  host: string,
  value: SiteConfigs
) => {
  const {
    EnvSet: {
      values: { isIntegrationTest },
    },
  } = await import('#src/env-set/index.js');
  if (isIntegrationTest) {
    return;
  }

  const response = await got.put(
    new URL(
      path.join(
        baseUrl.pathname,
        `/accounts/${auth.accountIdentifier}/storage/kv/namespaces/${
          auth.namespaceIdentifier
        }/values/${encodeURIComponent(`${auth.keyName}:${host}`)}`
      ),
      baseUrl
    ),
    {
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
      },
      throwHttpErrors: false,
      json: value,
    }
  );

  handleResponse(response);
};

export const deleteProtectedAppSiteConfigs = async (
  auth: ProtectedAppConfigProviderData,
  host: string
) => {
  const response = await got.delete(
    new URL(
      path.join(
        baseUrl.pathname,
        `/accounts/${auth.accountIdentifier}/storage/kv/namespaces/${
          auth.namespaceIdentifier
        }/values/${encodeURIComponent(`${auth.keyName}:${host}`)}`
      ),
      baseUrl
    ),
    {
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
      },
      throwHttpErrors: false,
    }
  );

  handleResponse(response);
};

/**
 * Deletes the edge region-lookup cache entry (`<keyName>:<host>`, e.g. `region:auth.example.com`)
 * so the edge worker resolves the hostname's region afresh on the next request. Needed when a
 * custom domain is re-bound to a tenant in another region, since the edge cache is otherwise only
 * evicted by TTL.
 */
export const deleteRegionLookupKvRecord = async (
  auth: RegionLookupKvProviderData,
  host: string
) => {
  const response = await got.delete(
    new URL(
      path.join(
        baseUrl.pathname,
        `/accounts/${auth.accountIdentifier}/storage/kv/namespaces/${
          auth.namespaceIdentifier
        }/values/${encodeURIComponent(`${auth.keyName}:${host}`)}`
      ),
      baseUrl
    ),
    {
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
      },
      throwHttpErrors: false,
    }
  );

  // The cache entry may have expired or never been written; a missing key is not an error.
  if (response.statusCode === 404) {
    return;
  }

  handleResponse(response);
};
