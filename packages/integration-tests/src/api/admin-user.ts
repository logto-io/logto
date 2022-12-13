import type { User } from '@logto/schemas';

import { authedAdminApi } from './api.js';

type CreateUserPayload = {
  primaryEmail?: string;
  username: string;
  password: string;
  name: string;
};

export const createUser = (payload: CreateUserPayload) =>
  authedAdminApi
    .post('users', {
      json: payload,
    })
    .json<User>();

export const getUser = (userId: string) => authedAdminApi.get(`users/${userId}`).json<User>();

export const getUsers = () => authedAdminApi.get('users').json<User[]>();

export const updateUser = (userId: string, payload: Partial<User>) =>
  authedAdminApi
    .patch(`users/${userId}`, {
      json: payload,
    })
    .json<User>();

export const deleteUser = (userId: string) => authedAdminApi.delete(`users/${userId}`);

export const updateUserPassword = (userId: string, password: string) =>
  authedAdminApi
    .patch(`users/${userId}/password`, {
      json: {
        password,
      },
    })
    .json<User>();

export const deleteUserIdentity = (userId: string, connectorTarget: string) =>
  authedAdminApi.delete(`users/${userId}/identities/${connectorTarget}`);
