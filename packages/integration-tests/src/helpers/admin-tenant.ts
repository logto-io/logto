// To refactor: should combine into other similar utils
// Since they are just different in URLs

import { type SocialUserInfo } from '@logto/connector-kit';
import type { LogtoConfig } from '@logto/node';
import {
  PredefinedScope,
  adminTenantId,
  defaultTenantId,
  getManagementApiResourceIndicator,
  adminConsoleApplicationId,
  InteractionEvent,
  type Role,
  type User,
  RoleType,
} from '@logto/schemas';

import { authedAdminTenantApi as api, adminTenantApi } from '#src/api/api.js';
import type { InteractionPayload } from '#src/api/interaction.js';
import { adminConsoleRedirectUri, logtoConsoleUrl } from '#src/constants.js';
import { initClient, initExperienceClient, processSession } from '#src/helpers/client.js';
import { generatePassword, generateUsername } from '#src/utils.js';

import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from './experience/social-verification.js';

export const resourceDefault = getManagementApiResourceIndicator(defaultTenantId);
export const resourceMe = getManagementApiResourceIndicator(adminTenantId, 'me');

export const createUserWithPassword = async () => {
  const username = generateUsername();
  const password = generatePassword();
  const user = await api
    .post('users', {
      json: { username, password },
    })
    .json<User>();

  return { user, username, password };
};

const createUserWithRoles = async (roleNames: string[]) => {
  const { user, username, password } = await createUserWithPassword();

  // Should have roles for default tenant Management API and admin tenant Me API
  const roles = await api.get('roles').json<Role[]>();
  await Promise.all(
    roles
      .filter(({ name, type }) => roleNames.includes(name) && type !== RoleType.MachineToMachine)
      .map(async ({ id }) =>
        api.post(`roles/${id}/users`, {
          json: { userIds: [user.id] },
        })
      )
  );

  return [user, { username, password }] as const;
};

export const createUserWithAllRoles = async () => {
  const allRoles = await api.get('roles').json<Role[]>();
  const allRoleNames = allRoles.map(({ name }) => name);
  return createUserWithRoles(allRoleNames);
};

export const deleteUser = async (id: string) => {
  await api.delete(`users/${id}`);
};

export const putInteraction = async (cookie: string, payload: InteractionPayload) =>
  adminTenantApi
    .put('interaction', {
      headers: { cookie },
      json: payload,
      redirect: 'manual',
      throwHttpErrors: false,
    })
    .json();

export const initAdminExperienceClient = async (config?: Partial<LogtoConfig>) =>
  initExperienceClient({
    interactionEvent: InteractionEvent.SignIn,
    config: { endpoint: logtoConsoleUrl, appId: adminConsoleApplicationId, ...config },
    redirectUri: adminConsoleRedirectUri,
    api: adminTenantApi,
  });

export const initClientAndSignIn = async (
  username: string,
  password: string,
  config?: Partial<LogtoConfig>
) => {
  const client = await initClient(
    {
      endpoint: logtoConsoleUrl,
      appId: adminConsoleApplicationId,
      ...config,
    },
    adminConsoleRedirectUri
  );
  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
    identifier: {
      username,
      password,
    },
  });
  const { redirectTo } = await client.submitInteraction();
  await client.processSession(redirectTo);

  return client;
};

export const createUserWithAllRolesAndSignInToClient = async () => {
  const [{ id }, { username, password }] = await createUserWithAllRoles();
  const client = await initClientAndSignIn(username, password, {
    resources: [resourceDefault, resourceMe],
    scopes: [PredefinedScope.All],
  });

  return { id, client, username, password };
};

export const signUpWithSocialAndSignInToClient = async (
  connectorId: string,
  socialUserInfo: SocialUserInfo
) => {
  const state = 'state';
  const redirectUri = 'http://localhost:3000';

  const client = await initAdminExperienceClient({
    resources: [resourceDefault, resourceMe],
    scopes: [PredefinedScope.All],
  });

  const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
    redirectUri,
    state,
  });

  const { id, ...rest } = socialUserInfo;

  await successfullyVerifySocialAuthorization(client, connectorId, {
    verificationId,
    connectorData: {
      state,
      redirectUri,
      code: 'fake_code',
      userId: socialUserInfo.id,
      ...rest,
    },
  });

  await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();
  const userId = await processSession(client, redirectTo);
  const existingUserRoles = await api.get(`users/${userId}/roles`).json<Role[]>();
  const existingUserRoleIds = new Set(existingUserRoles.map(({ id }) => id));

  // Should have roles for default tenant Management API and admin tenant Me API
  const roles = await api.get('roles').json<Role[]>();
  await Promise.all(
    roles
      .filter(({ id, type }) => !existingUserRoleIds.has(id) && type !== RoleType.MachineToMachine)
      .map(async ({ id }) =>
        api.post(`roles/${id}/users`, {
          json: { userIds: [userId] },
        })
      )
  );

  return { id: userId, client };
};
