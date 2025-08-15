import type {
  UpdateCustomProfileFieldData,
  UpdateCustomProfileFieldSieOrder,
  CustomProfileField,
  CustomProfileFieldUnion,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createCustomProfileField = async (data: CustomProfileFieldUnion) =>
  authedAdminApi
    .post('custom-profile-fields', {
      json: data,
    })
    .json<CustomProfileField>();

export const updateCustomProfileFieldByName = async (
  name: string,
  data: UpdateCustomProfileFieldData
) =>
  authedAdminApi
    .put(`custom-profile-fields/${name}`, {
      json: data,
    })
    .json<CustomProfileField>();

export const deleteCustomProfileFieldByName = async (name: string) =>
  authedAdminApi.delete(`custom-profile-fields/${name}`);

export const updateCustomProfileFieldsSieOrder = async (
  order: UpdateCustomProfileFieldSieOrder[]
) =>
  authedAdminApi
    .post('custom-profile-fields/properties/sie-order', {
      json: { order },
    })
    .json<CustomProfileField[]>();

export const findAllCustomProfileFields = async () =>
  authedAdminApi.get('custom-profile-fields').json<CustomProfileField[]>();

export const findCustomProfileFieldByName = async (name: string) =>
  authedAdminApi.get(`custom-profile-fields/${name}`).json<CustomProfileField>();

export const batchCreateCustomProfileFields = async (data: CustomProfileFieldUnion[]) =>
  authedAdminApi.post('custom-profile-fields/batch', { json: data }).json<CustomProfileField[]>();
