import { parseJson } from '@logto/connector-kit';
import { type DomainDnsRecords } from '@logto/schemas';

import assertThat from '../assert-that.js';

import { cloudflareResponseGuard } from './types.js';

export const parseCloudflareResponse = (body: string) => {
  const result = cloudflareResponseGuard.safeParse(parseJson(body));

  assertThat(result.success && result.data.success, 'domain.cloudflare_response_error');

  return result.data.result;
};

export const findVerificationTxtRecord = (records: DomainDnsRecords) =>
  records.find(
    ({ type, name }) => type.toUpperCase() === 'TXT' && name.includes('_cf-custom-hostname')
  );

export const findSslTxtRecord = (records: DomainDnsRecords) =>
  records.find(
    ({ type, name }) => type.toUpperCase() === 'TXT' && name.includes('_acme-challenge')
  );
