import type { Identities, Role, User } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export type CreateUserPayload = Partial<{
  primaryEmail: string;
  primaryPhone: string;
  username: string;
  password: string;
  name: string;
}>;

export const createUser = async (payload: CreateUserPayload = {}) =>
  authedAdminApi
    .post('users', {
      json: payload,
    })
    .json<User>();

export const getUser = async (userId: string) => authedAdminApi.get(`users/${userId}`).json<User>();

export const getUsers = async () => authedAdminApi.get('users').json<User[]>();

export const updateUser = async (userId: string, payload: Partial<User>) =>
  authedAdminApi
    .patch(`users/${userId}`, {
      json: payload,
    })
    .json<User>();

export const suspendUser = async (userId: string, isSuspended: boolean) =>
  authedAdminApi.patch(`users/${userId}/is-suspended`, { json: { isSuspended } }).json<User>();

export const deleteUser = async (userId: string) => authedAdminApi.delete(`users/${userId}`);

export const updateUserPassword = async (userId: string, password: string) =>
  authedAdminApi
    .patch(`users/${userId}/password`, {
      json: {
        password,
      },
    })
    .json<User>();

export const deleteUserIdentity = async (userId: string, connectorTarget: string) =>
  authedAdminApi.delete(`users/${userId}/identities/${connectorTarget}`);

export const assignRolesToUser = async (userId: string, roleIds: string[]) =>
  authedAdminApi.post(`users/${userId}/roles`, { json: { roleIds } });

export const getUserRoles = async (userId: string) =>
  authedAdminApi.get(`users/${userId}/roles`).json<Role[]>();

export const deleteRoleFromUser = async (userId: string, roleId: string) =>
  authedAdminApi.delete(`users/${userId}/roles/${roleId}`);

export const postUserIdentity = async (
  userId: string,
  connectorId: string,
  connectorData: Record<string, unknown>
) =>
  authedAdminApi
    .post(`users/${userId}/identities`, {
      json: {
        connectorId,
        connectorData,
      },
    })
    .json<Identities>();

export const verifyUserPassword = async (userId: string, password: string) =>
  authedAdminApi.post(`users/${userId}/password/verify`, { json: { password } });
