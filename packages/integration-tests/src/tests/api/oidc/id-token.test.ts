import { Prompt } from '@logto/node';
import { demoAppApplicationId } from '@logto/schemas';

import { assignRolesToUser, putRolesToUser } from '#src/api/index.js';
import { createRole } from '#src/api/role.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

describe('OpenID Connect ID token', () => {
  const organizationApi = new OrganizationApiTest();
  const username = generateUsername();
  const password = generatePassword();
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId = '';

  const fetchIdToken = async (scopes: string[], expectClaims?: Record<string, unknown>) => {
    const client = await initExperienceClient({
      config: {
        appId: demoAppApplicationId,
        prompt: Prompt.Login,
        scopes,
      },
      redirectUri: demoAppRedirectUri,
    });
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const idToken = await client.getIdTokenClaims();
    if (expectClaims) {
      expect(idToken).toMatchObject(expectClaims);
    }
    return idToken;
  };

  beforeAll(async () => {
    const { id } = await createUserByAdmin({ username, password });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = id;
    await enableAllPasswordSignInMethods();
  });

  afterEach(async () => {
    await Promise.all([
      organizationApi.cleanUp(),
      organizationApi.roleApi.cleanUp(),
      organizationApi.scopeApi.cleanUp(),
    ]);
  });

  it('should be issued with correct `username` and `roles` claims', async () => {
    const role = await createRole({});
    await assignRolesToUser(userId, [role.id]);
    // Should not throw when not adding any new role(s) to a user.
    await expect(putRolesToUser(userId, [role.id])).resolves.not.toThrow();
    await fetchIdToken(['username', 'roles'], {
      username,
      roles: [role.name],
    });
  });

  it('should be issued with `organizations` and `organization_roles` claims', async () => {
    const [org1, org2] = await Promise.all([
      organizationApi.create({ name: 'org1' }),
      organizationApi.create({ name: 'org2' }),
    ]);

    await Promise.all([
      organizationApi.addUsers(org1.id, [userId]),
      organizationApi.addUsers(org2.id, [userId]),
    ]);

    const role = await organizationApi.roleApi.create({ name: 'member' });
    await organizationApi.addUserRoles(org1.id, userId, [role.id]);

    // Organizations claim
    const { organizations } = await fetchIdToken(['urn:logto:scope:organizations']);

    expect(organizations).toHaveLength(2);
    expect(organizations).toContainEqual(org1.id);
    expect(organizations).toContainEqual(org2.id);

    // Organization roles claim
    const { organization_roles: organizationRoles } = await fetchIdToken([
      'urn:logto:scope:organization_roles',
    ]);

    expect(organizationRoles).toHaveLength(1);
    expect(organizationRoles).toContainEqual(`${org1.id}:${role.name}`);
  });
});
