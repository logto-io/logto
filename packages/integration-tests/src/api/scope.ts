import type { Scope, CreateScope } from '@logto/schemas';
import { type Options } from 'ky';

import { generateScopeName } from '#src/utils.js';

import { authedAdminApi } from './api.js';

export const getScopes = async (resourceId: string, options?: Options) =>
  authedAdminApi.get(`resources/${resourceId}/scopes`, options).json<Scope[]>();

export const createScope = async (resourceId: string, name?: string) => {
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

export const updateScope = async (
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

export const deleteScope = async (resourceId: string, scopeId: string) =>
  authedAdminApi.delete(`resources/${resourceId}/scopes/${scopeId}`);
