import type { Scope, CreateScope } from '@logto/schemas';
import type { OptionsOfTextResponseBody } from 'got';

import { generateScopeName } from '#src/utils.js';

import { authedAdminApi } from './api.js';

export const getScopes = (resourceId: string, options?: OptionsOfTextResponseBody) =>
  authedAdminApi.get(`resources/${resourceId}/scopes`, options).json<Scope[]>();

export const createScope = (resourceId: string, name?: string) => {
  const scopeName = name ?? generateScopeName();

  return authedAdminApi
    .post(`resources/${resourceId}/scopes`, {
      json: {
        name: scopeName,
        description: scopeName,
      },
    })
    .json<Scope>();
};

export const updateScope = (
  resourceId: string,
  scopeId: string,
  payload: Partial<Omit<CreateScope, 'id' | 'resourceId'>>
) =>
  authedAdminApi
    .patch(`resources/${resourceId}/scopes/${scopeId}`, {
      json: {
        ...payload,
      },
    })
    .json<Scope>();

export const deleteScope = (resourceId: string, scopeId: string) =>
  authedAdminApi.delete(`resources/${resourceId}/scopes/${scopeId}`);
