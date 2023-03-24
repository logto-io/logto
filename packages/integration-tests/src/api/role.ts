import type { CreateRole, Role, Scope, User } from '@logto/schemas';

import { generateRoleName } from '#src/utils.js';

import { authedAdminApi } from './api.js';

export const createRole = async (name?: string, description?: string, scopeIds?: string[]) =>
  authedAdminApi
    .post('roles', {
      json: {
        name: name ?? generateRoleName(),
        description: description ?? generateRoleName(),
        scopeIds,
      },
    })
    .json<Role>();

export const getRoles = async () => authedAdminApi.get('roles').json<Role[]>();

export const getRole = async (roleId: string) => authedAdminApi.get(`roles/${roleId}`).json<Role>();

export const updateRole = async (roleId: string, payload: Partial<Omit<CreateRole, 'id'>>) =>
  authedAdminApi
    .patch(`roles/${roleId}`, {
      json: {
        ...payload,
      },
    })
    .json<Role>();

export const deleteRole = async (roleId: string) => authedAdminApi.delete(`roles/${roleId}`);

export const getRoleScopes = async (roleId: string) =>
  authedAdminApi.get(`roles/${roleId}/scopes`).json<Scope[]>();

export const assignScopesToRole = async (scopeIds: string[], roleId: string) =>
  authedAdminApi
    .post(`roles/${roleId}/scopes`, {
      json: { scopeIds },
    })
    .json<Scope[]>();

export const deleteScopeFromRole = async (scopeId: string, roleId: string) =>
  authedAdminApi.delete(`roles/${roleId}/scopes/${scopeId}`);

export const getRoleUsers = async (roleId: string) =>
  authedAdminApi.get(`roles/${roleId}/users`).json<User[]>();

export const assignUsersToRole = async (userIds: string[], roleId: string) =>
  authedAdminApi.post(`roles/${roleId}/users`, {
    json: { userIds },
  });

export const deleteUserFromRole = async (userId: string, roleId: string) =>
  authedAdminApi.delete(`roles/${roleId}/users/${userId}`);
