import path from 'node:path';

import { type HostnameProviderData, cloudflareDataGuard } from '@logto/schemas';
import { got } from 'got';

import RequestError from '#src/errors/RequestError/index.js';

import assertThat from '../assert-that.js';

import { baseUrl } from './consts.js';
import { mockCustomHostnameResponse } from './mock.js';
import { parseCloudflareResponse } from './utils.js';

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

  if (!response.ok) {
    if (response.statusCode === 409) {
      throw new RequestError('domain.hostname_already_exists');
    }

    throw new RequestError(
      {
        code: 'domain.cloudflare_unknown_error',
        status: 500,
      },
      response.body
    );
  }

  const result = cloudflareDataGuard.safeParse(parseCloudflareResponse(response.body));

  assertThat(result.success, 'domain.cloudflare_response_error');

  return result.data;
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

  assertThat(
    response.ok,
    new RequestError(
      {
        code: 'domain.cloudflare_unknown_error',
        status: 500,
      },
      response.body
    )
  );

  const result = cloudflareDataGuard.safeParse(parseCloudflareResponse(response.body));

  assertThat(result.success, 'domain.cloudflare_response_error');

  return result.data;
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

  assertThat(
    response.ok,
    new RequestError(
      {
        code: 'domain.cloudflare_unknown_error',
        status: 500,
      },
      response.body
    )
  );
};
