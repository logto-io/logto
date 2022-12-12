import type { Resource, CreateResource } from '@logto/schemas';
import type { OptionsOfTextResponseBody } from 'got';

import { generateResourceIndicator, generateResourceName } from '#src/utils.js';

import { authedAdminApi } from './api.js';

export const createResource = (name?: string, indicator?: string) =>
  authedAdminApi
    .post('resources', {
      json: {
        name: name ?? generateResourceName(),
        indicator: indicator ?? generateResourceIndicator(),
      },
    })
    .json<Resource>();

export const getResource = (resourceId: string, options?: OptionsOfTextResponseBody) =>
  authedAdminApi.get(`resources/${resourceId}`, options).json<Resource>();

export const updateResource = (
  resourceId: string,
  payload: Partial<Omit<CreateResource, 'id' | 'indicator'>>
) =>
  authedAdminApi
    .patch(`resources/${resourceId}`, {
      json: {
        ...payload,
      },
    })
    .json<Resource>();

export const deleteResource = (resourceId: string) =>
  authedAdminApi.delete(`resources/${resourceId}`);
