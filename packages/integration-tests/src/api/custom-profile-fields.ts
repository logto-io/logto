import type {
  CreateCustomProfileFieldData,
  UpdateCustomProfileFieldData,
  UpdateCustomProfileFieldSieOrder,
  CustomProfileField,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createCustomProfileField = async (data: CreateCustomProfileFieldData) =>
  authedAdminApi
    .post('custom-profile-fields', {
      json: data,
    })
    .json<CustomProfileField>();

export const updateCustomProfileFieldById = async (
  id: string,
  data: UpdateCustomProfileFieldData
) =>
  authedAdminApi
    .patch(`custom-profile-fields/${id}`, {
      json: data,
    })
    .json<CustomProfileField>();

export const deleteCustomProfileFieldById = async (id: string) =>
  authedAdminApi.delete(`custom-profile-fields/${id}`);

export const updateCustomProfileFieldsSieOrder = async (
  order: UpdateCustomProfileFieldSieOrder[]
) =>
  authedAdminApi
    .put('custom-profile-fields/sie-order', {
      json: { order },
    })
    .json<CustomProfileField[]>();

export const findAllCustomProfileFields = async () =>
  authedAdminApi.get('custom-profile-fields').json<CustomProfileField[]>();

export const findCustomProfileFieldById = async (id: string) =>
  authedAdminApi.get(`custom-profile-fields/${id}`).json<CustomProfileField>();
