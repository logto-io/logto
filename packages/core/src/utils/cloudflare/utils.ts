import { parseJson } from '@logto/connector-kit';
import { type Response } from 'got';
import { type ZodType } from 'zod';

import assertThat from '../assert-that.js';

import { type HandleResponse, cloudflareResponseGuard } from './types.js';

const parseCloudflareResponse = (body: string) => {
  const result = cloudflareResponseGuard.safeParse(parseJson(body));

  assertThat(result.success && result.data.success, 'domain.cloudflare_response_error');

  return result.data.result;
};

export const buildHandleResponse = (handleError: (statusCode: number) => never) => {
  const handleResponse: HandleResponse = <T>(response: Response<string>, guard?: ZodType<T>) => {
    if (!response.ok) {
      handleError(response.statusCode);
    }

    if (!guard) {
      return;
    }

    const result = guard.safeParse(parseCloudflareResponse(response.body));

    assertThat(result.success, 'domain.cloudflare_response_error');

    return result.data;
  };

  return handleResponse;
};
