import { ApplicationType, OrganizationInvitationStatus } from '@logto/schemas';
import { assert, noop } from '@silverhand/essentials';

import { authedAdminApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import {
  OrganizationApiTest,
  OrganizationInvitationApiTest,
  OrganizationRoleApiTest,
  OrganizationScopeApiTest,
} from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';
import { generateName } from '#src/utils.js';

import { verifySignature } from './WebhookMockServer.js';
import {
  organizationDataHookTestCases,
  organizationRoleDataHookTestCases,
  organizationScopeDataHookTestCases,
} from './test-cases-organization.js';
import { type HookPayloadArgs, type SetupContext } from './test-cases.js';
import { createDataHookFixture, partitionManagementApiHookKeys } from './webhook-fixtures.js';

const fixture = createDataHookFixture(9999, 'org-membership-api-hook');
const { webHookApi, hookName, webhookResults, getWebhookResult } = fixture;

beforeAll(async () => {
  await fixture.start();
});

afterAll(async () => {
  await fixture.cleanup();
});

describe('organization data hook events', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let organizationId: string;
  let userId: string;
  let applicationId: string;
  let applicationIdB: string;
  /* eslint-enable @silverhand/fp/no-let */

  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();

  beforeAll(async () => {
    const organization = await organizationApi.create({
      name: generateName(),
      description: 'organization data hook test organization.',
    });

    const user = await userApi.create({ name: generateName() });
    const application = await createApplication(generateName(), ApplicationType.MachineToMachine);
    const applicationB = await createApplication(generateName(), ApplicationType.MachineToMachine);

    /* eslint-disable @silverhand/fp/no-mutation */
    organizationId = organization.id;
    userId = user.id;
    applicationId = application.id;
    applicationIdB = applicationB.id;
    /* eslint-enable @silverhand/fp/no-mutation */

    const organizationCreateHook = await getWebhookResult('POST /organizations');
    expect(organizationCreateHook?.payload.event).toBe('Organization.Created');
  });

  afterAll(async () => {
    await Promise.all([
      userApi.cleanUp(),
      deleteApplication(applicationId).catch(noop),
      deleteApplication(applicationIdB).catch(noop),
    ]);
  });

  it.each(organizationDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload, hookPayload, setup }) => {
      if (setup) {
        const setupContext: SetupContext = {
          organizationApi,
          organizationId,
          userId,
          applicationId,
          applicationIdB,
        };
        await setup(setupContext);
      }

      await authedAdminApi[method](
        endpoint
          .replace('{organizationId}', organizationId)
          .replace('{userId}', userId)
          .replace('{applicationIdB}', applicationIdB)
          .replace('{applicationId}', applicationId),
        {
          json: JSON.parse(
            JSON.stringify(payload)
              .replace('{userId}', userId)
              .replace('{applicationIdB}', applicationIdB)
              .replace('{applicationId}', applicationId)
          ),
        }
      );
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
      if (hookPayload) {
        const resolved =
          typeof hookPayload === 'function'
            ? hookPayload({
                userId,
                organizationId,
                applicationId,
                applicationIdB,
              } satisfies HookPayloadArgs)
            : hookPayload;
        expect(hook?.payload).toMatchObject(resolved);
        // `toMatchObject` is partial-match; assert absence of every delta field
        // a case did not declare so the omit-empty contract is regression-protected
        // end-to-end.
        for (const field of [
          'addedUserIds',
          'removedUserIds',
          'addedApplicationIds',
          'removedApplicationIds',
        ]) {
          if (!(field in resolved)) {
            expect(hook?.payload).not.toHaveProperty(field);
          }
        }
      }
    }
  );
});

describe('organization scope data hook events', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let scopeId: string;

  const organizationScopeApi = new OrganizationScopeApiTest();

  beforeAll(async () => {
    const scope = await organizationScopeApi.create({
      name: generateName(),
      description: 'organization scope data hook test scope.',
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    scopeId = scope.id;

    const organizationScopeCreateHook = await getWebhookResult('POST /organization-scopes');
    expect(organizationScopeCreateHook?.payload.event).toBe('OrganizationScope.Created');
  });

  afterAll(async () => {
    await organizationScopeApi.cleanUp();
  });

  it.each(organizationScopeDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload }) => {
      await authedAdminApi[method](endpoint.replace('{organizationScopeId}', scopeId), {
        json: payload,
      });
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
    }
  );
});

describe('organization role data hook events', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let roleId: string;
  let scopeId: string;
  /* eslint-enable @silverhand/fp/no-let */

  const organizationScopeApi = new OrganizationScopeApiTest();
  const roleApi = new OrganizationRoleApiTest();

  beforeAll(async () => {
    const role = await roleApi.create({
      name: generateName(),
      description: 'organization role data hook test role.',
    });

    const scope = await organizationScopeApi.create({
      name: generateName(),
      description: 'organization role data hook test scope.',
    });

    /* eslint-disable @silverhand/fp/no-mutation */
    roleId = role.id;
    scopeId = scope.id;
    /* eslint-enable @silverhand/fp/no-mutation */

    const organizationRoleCreateHook = await getWebhookResult('POST /organization-roles');
    expect(organizationRoleCreateHook?.payload.event).toBe('OrganizationRole.Created');
  });

  afterAll(async () => {
    await Promise.all([organizationScopeApi.cleanUp(), roleApi.cleanUp()]);
  });

  it.each(organizationRoleDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload }) => {
      await authedAdminApi[method](
        endpoint.replace('{organizationRoleId}', roleId).replace('{scopeId}', scopeId),
        { json: JSON.parse(JSON.stringify(payload).replace('{scopeId}', scopeId)) }
      );
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
    }
  );
});

describe('organization invitation membership webhook', () => {
  const invitationApi = new OrganizationInvitationApiTest();
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();

  afterEach(async () => {
    await Promise.all([organizationApi.cleanUp(), invitationApi.cleanUp(), userApi.cleanUp()]);
  });

  it('emits Organization.Membership.Updated with addedUserIds on invitation accept', async () => {
    const organization = await organizationApi.create({ name: generateName() });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${generateName()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });
    const user = await userApi.create({ primaryEmail: invitation.invitee });

    await invitationApi.updateStatus(invitation.id, OrganizationInvitationStatus.Accepted, user.id);

    const hook = await getWebhookResult('PUT /organization-invitations/:id/status');
    expect(hook?.payload.event).toBe('Organization.Membership.Updated');
    expect(hook?.payload).toMatchObject({
      organizationId: organization.id,
      addedUserIds: [user.id],
    });
    expect(hook?.payload).not.toHaveProperty('removedUserIds');
  });

  it('emits Organization.Membership.Updated with no delta fields when the accepted user is already a member', async () => {
    const organization = await organizationApi.create({ name: generateName() });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${generateName()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });
    const user = await userApi.create({ primaryEmail: invitation.invitee });

    // Pre-add the user so the invitation-accept insert no-ops.
    await organizationApi.addUsers(organization.id, [user.id]);

    // Clear any prior result so we can assert the freshly-emitted payload below.
    webhookResults.delete('PUT /organization-invitations/:id/status');

    await invitationApi.updateStatus(invitation.id, OrganizationInvitationStatus.Accepted, user.id);

    // Re-accept of an already-member still emits (matches the project-wide
    // "no-op still emits" contract used by every other Organization.Membership.Updated
    // trigger), but with no delta fields because there was no real membership change.
    const hook = await getWebhookResult('PUT /organization-invitations/:id/status');
    expect(hook?.payload.event).toBe('Organization.Membership.Updated');
    expect(hook?.payload).toMatchObject({ organizationId: organization.id });
    expect(hook?.payload).not.toHaveProperty('addedUserIds');
    expect(hook?.payload).not.toHaveProperty('removedUserIds');
  });
});

describe('organization data hook events coverage and signature verification', () => {
  const { organizationKeys } = partitionManagementApiHookKeys();

  it.each(organizationKeys)('should have test case for %s', async (key) => {
    const webhook = webHookApi.hooks.get(hookName)!;

    const webhookResult = await getWebhookResult(key);
    expect(webhookResult).toBeDefined();
    expect(webhookResult?.payload.status).not.toBe(404);
    assert(webhookResult, new Error('webhookResult is undefined'));

    const { signature, rawPayload } = webhookResult;
    expect(verifySignature(rawPayload, webhook.signingKey, signature)).toBeTruthy();
  });
});
