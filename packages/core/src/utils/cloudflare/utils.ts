import { parseJson } from '@logto/connector-kit';
import { type CloudflareData, DomainStatus } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import { type Response } from 'got';
import { type ZodType } from 'zod';

import assertThat from '../assert-that.js';

import { type HandleResponse, cloudflareResponseGuard } from './types.js';

const consoleLog = new ConsoleLog(chalk.magenta('cf'));

const parseCloudflareResponse = (body: string) => {
  const result = cloudflareResponseGuard.safeParse(parseJson(body));

  assertThat(result.success && result.data.success, 'domain.cloudflare_response_error');

  return result.data.result;
};

export const buildHandleResponse = (handleError: (statusCode: number) => never) => {
  const handleResponse: HandleResponse = <T>(response: Response<string>, guard?: ZodType<T>) => {
    if (!response.ok) {
      consoleLog.error('Cloudflare API error', response.statusCode, response.body);
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

/**
 * Parse the string response from Cloudflare API and return the domain status
 * there are lots of status in Cloudflare API, but we only care about whether it's active or not
 * see https://developers.cloudflare.com/api/operations/custom-hostname-for-a-zone-custom-hostname-details
 */
export const getDomainStatusFromCloudflareData = (data: CloudflareData): DomainStatus => {
  switch (data.status) {
    case 'active': {
      return data.ssl.status === 'active' ? DomainStatus.Active : DomainStatus.PendingSsl;
    }
    default: {
      return DomainStatus.PendingVerification;
    }
  }
};
