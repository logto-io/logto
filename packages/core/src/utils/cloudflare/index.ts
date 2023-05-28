import { type HostnameProviderData, cloudflareDataGuard } from '@logto/schemas';
import { got } from 'got';

import assertThat from '../assert-that.js';

import { baseUrl } from './consts.js';
import { parseCloudflareResponse } from './utils.js';

export const createCustomHostname = async (auth: HostnameProviderData, hostname: string) => {
  const response = await got.post(`${baseUrl}/zones/${auth.zoneId}/custom_hostnames`, {
    headers: {
      Authentication: `Bearer ${auth.apiToken}`,
    },
    json: {
      hostname,
      ssl: { method: 'txt', type: 'dv', settings: { min_tls_version: '1.0' } },
    },
  });

  assertThat(response.ok, 'domain.cloudflare_unknown_error');

  const result = cloudflareDataGuard.safeParse(parseCloudflareResponse(response.body));

  assertThat(result.success, 'domain.cloudflare_response_error');

  return result.data;
};

export const getCustomHostname = async (auth: HostnameProviderData, identifier: string) => {
  const response = await got.get(`${baseUrl}/zones/${auth.zoneId}/custom_hostnames/${identifier}`, {
    headers: {
      Authentication: `Bearer ${auth.apiToken}`,
    },
  });

  assertThat(response.ok, 'domain.cloudflare_unknown_error');

  const result = cloudflareDataGuard.safeParse(parseCloudflareResponse(response.body));

  assertThat(result.success, 'domain.cloudflare_response_error');

  return result.data;
};
