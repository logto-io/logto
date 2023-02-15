// To refactor: should combine into other similar utils
// Since they are just different in URLs

import type { LogtoConfig } from '@logto/node';
import type { Role, User } from '@logto/schemas';
import {
  PredefinedScope,
  adminTenantId,
  defaultTenantId,
  getManagementApiResourceIndicator,
  adminConsoleApplicationId,
  InteractionEvent,
} from '@logto/schemas';

import { authedAdminTenantApi as api, adminTenantApi } from '#src/api/api.js';
import type { InteractionPayload } from '#src/api/interaction.js';
import { adminConsoleRedirectUri, logtoConsoleUrl } from '#src/constants.js';
import { initClient } from '#src/helpers/client.js';
import { generatePassword, generateUsername } from '#src/utils.js';

export const resourceDefault = getManagementApiResourceIndicator(defaultTenantId);
export const resourceMe = getManagementApiResourceIndicator(adminTenantId, 'me');

export const createResponseWithCode = (statusCode: number) => ({
  response: { statusCode },
});

export const createUserWithAllRoles = async () => {
  const username = generateUsername();
  const password = generatePassword();
  const user = await api
    .post('users', {
      json: { username, password },
    })
    .json<User>();

  // Should have roles for default tenant Management API and admin tenant Me API
  const roles = await api.get('roles').json<Role[]>();
  await Promise.all(
    roles.map(async ({ id }) =>
      api.post(`roles/${id}/users`, {
        json: { userIds: [user.id] },
      })
    )
  );

  return [user, { username, password }] as const;
};

export const deleteUser = async (id: string) => {
  await api.delete(`users/${id}`);
};

export const putInteraction = async (cookie: string, payload: InteractionPayload) =>
  adminTenantApi
    .put('interaction', {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json();

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

export const createUserAndSignInWithClient = async () => {
  const [{ id }, { username, password }] = await createUserWithAllRoles();
  const client = await initClientAndSignIn(username, password, {
    resources: [resourceDefault, resourceMe],
    scopes: [PredefinedScope.All],
  });

  return { id, client };
};
