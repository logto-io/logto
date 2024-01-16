import path from 'node:path';

import { type ProtectedAppConfigProviderData } from '@logto/schemas';
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
