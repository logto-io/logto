import path from 'node:path';

import { type HostnameProviderData, cloudflareDataGuard } from '@logto/schemas';
import { got } from 'got';

import RequestError from '#src/errors/RequestError/index.js';

import { baseUrl } from './consts.js';
import { mockCustomHostnameResponse, mockFallbackOrigin } from './mock.js';
import { cloudflareHostnameResponseGuard } from './types.js';
import { buildHandleResponse } from './utils.js';

export * from './kv.js';

const handleResponse = buildHandleResponse((statusCode) => {
  if (statusCode === 409) {
    throw new RequestError('domain.hostname_already_exists');
  }

  if (statusCode === 404) {
    throw new RequestError('domain.cloudflare_not_found');
  }

  throw new RequestError({
    code: 'domain.cloudflare_unknown_error',
    status: 500,
  });
});

export const getFallbackOrigin = async (auth: HostnameProviderData): Promise<string> => {
  const {
    EnvSet: {
      values: { isIntegrationTest },
    },
  } = await import('#src/env-set/index.js');
  if (isIntegrationTest) {
    return mockFallbackOrigin;
  }

  const response = await got.get(
    new URL(
      path.join(baseUrl.pathname, `/zones/${auth.zoneId}/custom_hostnames/fallback_origin`),
      baseUrl
    ),
    {
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
      },
      throwHttpErrors: false,
    }
  );

  const result = handleResponse(response, cloudflareHostnameResponseGuard);
  return result.origin;
};

export const createCustomHostname = async (auth: HostnameProviderData, hostname: string) => {
  const {
    EnvSet: {
      values: { isIntegrationTest },
    },
  } = await import('#src/env-set/index.js');
  if (isIntegrationTest) {
    return mockCustomHostnameResponse();
  }

  const response = await got.post(
    new URL(path.join(baseUrl.pathname, `/zones/${auth.zoneId}/custom_hostnames`), baseUrl),
    {
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
      },
      json: {
        hostname,
        ssl: { method: 'http', type: 'dv', settings: { min_tls_version: '1.2' } },
      },
      throwHttpErrors: false,
    }
  );

  return handleResponse(response, cloudflareDataGuard);
};

export const getCustomHostname = async (auth: HostnameProviderData, identifier: string) => {
  const {
    EnvSet: {
      values: { isIntegrationTest },
    },
  } = await import('#src/env-set/index.js');
  if (isIntegrationTest) {
    return mockCustomHostnameResponse(identifier);
  }

  const response = await got.get(
    new URL(
      path.join(baseUrl.pathname, `/zones/${auth.zoneId}/custom_hostnames/${identifier}`),
      baseUrl
    ),
    {
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
      },
      throwHttpErrors: false,
    }
  );

  return handleResponse(response, cloudflareDataGuard);
};

export const deleteCustomHostname = async (auth: HostnameProviderData, identifier: string) => {
  const {
    EnvSet: {
      values: { isIntegrationTest },
    },
  } = await import('#src/env-set/index.js');
  if (isIntegrationTest) {
    return;
  }

  const response = await got.delete(
    new URL(
      path.join(baseUrl.pathname, `/zones/${auth.zoneId}/custom_hostnames/${identifier}`),
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

export { getDomainStatusFromCloudflareData } from './utils.js';
