// To refactor: should combine into other similar utils
// Since they are just different in URLs

import type { LogtoConfig } from '@logto/node';
import {
  cloudApiIndicator,
  CloudScope,
  PredefinedScope,
  adminTenantId,
  defaultTenantId,
  getManagementApiResourceIndicator,
  getManagementApiAdminName,
  adminConsoleApplicationId,
  InteractionEvent,
  AdminTenantRole,
  type Role,
  type User,
} from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';

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

const createUserWithRoles = async (roleNames: string[]) => {
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
    roles
      .filter(({ name }) => roleNames.includes(name))
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

export const createUserWithAllRolesAndSignInToClient = async () => {
  const [{ id }, { username, password }] = await createUserWithAllRoles();
  const client = await initClientAndSignIn(username, password, {
    resources: [resourceDefault, resourceMe],
    scopes: [PredefinedScope.All],
  });

  return { id, client };
};

export const createUserAndSignInToCloudClient = async (
  userRoleType: AdminTenantRole.User | AdminTenantRole.Admin
) => {
  const [{ id }, { username, password }] = await createUserWithRoles(
    conditionalArray<string>(
      AdminTenantRole.User,
      userRoleType === AdminTenantRole.Admin && getManagementApiAdminName(adminTenantId)
    )
  );
  const client = await initClientAndSignIn(username, password, {
    resources: [cloudApiIndicator],
    scopes: Object.values(CloudScope),
  });

  return { id, client };
};
