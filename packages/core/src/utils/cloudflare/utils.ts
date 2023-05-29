import { parseJson } from '@logto/connector-kit';

import assertThat from '../assert-that.js';

import { cloudflareResponseGuard } from './types.js';

export const parseCloudflareResponse = (body: string) => {
  const result = cloudflareResponseGuard.safeParse(parseJson(body));

  assertThat(result.success, 'domain.cloudflare_response_error');
  assertThat(result.data.success, 'domain.cloudflare_response_error');

  return result.data.result;
};
