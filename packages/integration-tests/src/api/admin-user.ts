import type { Role, User } from '@logto/schemas';

import { authedAdminApi } from './api.js';

type CreateUserPayload = Partial<{
  primaryEmail: string;
  primaryPhone: string;
  username: string;
  password: string;
  name: string;
  isAdmin: boolean;
}>;

export const createUser = async (payload: CreateUserPayload) =>
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
