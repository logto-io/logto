import type { DomainResponse, DomainVerificationFile } from '@logto/schemas';

import { generateDomain } from '#src/utils.js';

import { authedAdminApi } from './api.js';

export const createDomain = async (domain?: string) =>
  authedAdminApi
    .post('domains', {
      json: {
        domain: domain ?? generateDomain(),
      },
    })
    .json<DomainResponse>();

export const getDomains = async () => authedAdminApi.get('domains').json<DomainResponse[]>();

export const getDomain = async (domainId: string) =>
  authedAdminApi.get(`domains/${domainId}`).json<DomainResponse>();

export const deleteDomain = async (domainId: string) =>
  authedAdminApi.delete(`domains/${domainId}`);

export const getDomainVerificationFiles = async (domainId: string) =>
  authedAdminApi.get(`domains/${domainId}/verification-files`).json<DomainVerificationFile[]>();

export const updateDomainVerificationFiles = async (
  domainId: string,
  verificationFiles: DomainVerificationFile[]
) =>
  authedAdminApi
    .put(`domains/${domainId}/verification-files`, { json: { verificationFiles } })
    .json<DomainVerificationFile[]>();
