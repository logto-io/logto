import type { CreateRole, Role, Scope, User } from '@logto/schemas';

import { generateRoleName } from '#src/utils.js';

import { authedAdminApi } from './api.js';

export const createRole = (name?: string, description?: string, scopeIds?: string[]) =>
  authedAdminApi
    .post('roles', {
      json: {
        name: name ?? generateRoleName(),
        description: description ?? generateRoleName(),
        scopeIds,
      },
    })
    .json<Role>();

export const getRoles = () => authedAdminApi.get('roles').json<Role[]>();

export const getRole = (roleId: string) => authedAdminApi.get(`roles/${roleId}`).json<Role>();

export const updateRole = (roleId: string, payload: Partial<Omit<CreateRole, 'id'>>) =>
  authedAdminApi
    .patch(`roles/${roleId}`, {
      json: {
        ...payload,
      },
    })
    .json<Role>();

export const deleteRole = (roleId: string) => authedAdminApi.delete(`roles/${roleId}`);

export const getRoleScopes = (roleId: string) =>
  authedAdminApi.get(`roles/${roleId}/scopes`).json<Scope[]>();

export const assignScopesToRole = (scopeIds: string[], roleId: string) =>
  authedAdminApi
    .post(`roles/${roleId}/scopes`, {
      json: { scopeIds },
    })
    .json<Scope[]>();

export const deleteScopeFromRole = (scopeId: string, roleId: string) =>
  authedAdminApi.delete(`roles/${roleId}/scopes/${scopeId}`);

export const getRoleUsers = (roleId: string) =>
  authedAdminApi.get(`roles/${roleId}/users`).json<User[]>();

export const assignUsersToRole = (userIds: string[], roleId: string) =>
  authedAdminApi.post(`roles/${roleId}/users`, {
    json: { userIds },
  });

export const deleteUserFromRole = (userId: string, roleId: string) =>
  authedAdminApi.delete(`roles/${roleId}/users/${userId}`);
