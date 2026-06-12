import {
  type ApplicationAccessControl,
  ApplicationType,
  createDefaultApplicationAccessControl,
  RoleType,
} from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationAccessControl,
  getApplications,
  replaceApplicationAccessControl,
  updateApplication,
} from '#src/api/application.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
import {
  deleteSamlApplication,
  getSamlApplication,
  updateSamlApplication,
} from '#src/api/saml-application.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

const buildAccessControl = (
  patch: Partial<ApplicationAccessControl> = {}
): ApplicationAccessControl => ({
  ...createDefaultApplicationAccessControl(),
  ...patch,
});

const missingId = () => `missing_${generateTestName()}`;

const putApplicationAccessControl = async (
  applicationId: string,
  accessControl: ApplicationAccessControl
) =>
  authedAdminApi.put(`applications/${applicationId}/access-control`, {
    json: accessControl,
    throwHttpErrors: false,
  });

const expectPutApplicationAccessControlError = async (
  applicationId: string,
  accessControl: ApplicationAccessControl,
  status: number,
  code: string
) => {
  const response = await putApplicationAccessControl(applicationId, accessControl);

  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toMatchObject({ code });
};

const createOrReuseSamlApplication = async () => {
  const response = await authedAdminApi.post('saml-applications', {
    json: {
      name: generateTestName(),
      description: null,
    },
    throwHttpErrors: false,
  });

  if (response.ok) {
    return {
      application: await response.json<Awaited<ReturnType<typeof getSamlApplication>>>(),
      shouldDelete: true,
    };
  }

  const error = await response.json<{ code?: string }>();
  if (response.status === 403 && error.code === 'application.saml.reach_oss_limit') {
    const [application] = await getApplications([ApplicationType.SAML]);

    expect(application).toBeDefined();

    return {
      application: application!,
      shouldDelete: false,
    };
  }

  throw new Error(`Failed to create SAML application: ${response.status} ${error.code ?? ''}`);
};

const createProtectedApplication = async () =>
  createApplication(generateTestName(), ApplicationType.Protected, {
    protectedAppMetadata: {
      origin: 'https://example.com',
      subDomain: generateTestName().replaceAll('_', '-'),
    },
  });

type TestApplication = {
  id: string;
  type: ApplicationType;
  isThirdParty?: boolean;
  updateEnabled: (enabled: boolean) => Promise<unknown>;
  cleanup: () => Promise<unknown>;
};

const createApplicationMatrix = async (): Promise<TestApplication[]> => {
  const [
    spaApplication,
    traditionalApplication,
    thirdPartyApplication,
    nativeApplication,
    protectedApplication,
    samlResult,
  ] = await Promise.all([
    createApplication(generateTestName(), ApplicationType.SPA),
    createApplication(generateTestName(), ApplicationType.Traditional),
    createApplication(generateTestName(), ApplicationType.Traditional, { isThirdParty: true }),
    createApplication(generateTestName(), ApplicationType.Native),
    createProtectedApplication(),
    createOrReuseSamlApplication(),
  ]);

  const createOidcAppEntry = (application: Awaited<ReturnType<typeof createApplication>>) => ({
    id: application.id,
    type: application.type,
    isThirdParty: application.isThirdParty,
    updateEnabled: async (enabled: boolean) =>
      updateApplication(application.id, { appLevelAccessControlEnabled: enabled }),
    cleanup: async () => deleteApplication(application.id),
  });

  return [
    createOidcAppEntry(spaApplication),
    createOidcAppEntry(traditionalApplication),
    createOidcAppEntry(thirdPartyApplication),
    createOidcAppEntry(nativeApplication),
    createOidcAppEntry(protectedApplication),
    {
      id: samlResult.application.id,
      type: ApplicationType.SAML,
      updateEnabled: async (enabled: boolean) =>
        updateSamlApplication(samlResult.application.id, {
          appLevelAccessControlEnabled: enabled,
        }),
      cleanup: async () => {
        if (samlResult.shouldDelete) {
          await deleteSamlApplication(samlResult.application.id);
          return;
        }

        await updateSamlApplication(samlResult.application.id, {
          appLevelAccessControlEnabled: false,
        });
        await replaceApplicationAccessControl(
          samlResult.application.id,
          createDefaultApplicationAccessControl()
        );
      },
    },
  ];
};

const createRuleMatrix = async () => {
  const organizationApi = new OrganizationApiTest();
  const { user } = await createDefaultTenantUserWithPassword();
  const userRole = await createRole({ type: RoleType.User });
  const [organization, organizationWithRole] = await Promise.all([
    organizationApi.create({ name: generateTestName() }),
    organizationApi.create({ name: generateTestName() }),
  ]);
  const organizationRole = await organizationApi.roleApi.create({
    name: generateTestName(),
    type: RoleType.User,
  });

  return {
    rules: [
      {
        name: 'User IDs',
        accessControl: buildAccessControl({ userIds: [user.id] }),
      },
      {
        name: 'User roles',
        accessControl: buildAccessControl({ userRoleIds: [userRole.id] }),
      },
      {
        name: 'Organizations',
        accessControl: buildAccessControl({ organizationIds: [organization.id] }),
      },
      {
        name: 'Organization roles',
        accessControl: buildAccessControl({
          organizationRoleRules: [
            {
              organizationId: organizationWithRole.id,
              organizationRoleIds: [organizationRole.id],
            },
          ],
        }),
      },
    ],
    cleanup: async () =>
      Promise.allSettled([
        deleteDefaultTenantUser(user.id),
        deleteRole(userRole.id),
        organizationApi.cleanUp(),
      ]),
  };
};

devFeatureTest.describe('application access control Management API', () => {
  it('returns default disabled config and saves deduplicated rules', async () => {
    const organizationApi = new OrganizationApiTest();
    const { user } = await createDefaultTenantUserWithPassword();
    const application = await createApplication(generateTestName(), ApplicationType.SPA);
    const userRole = await createRole({ type: RoleType.User });

    try {
      const [organization, organizationWithRole] = await Promise.all([
        organizationApi.create({ name: generateTestName() }),
        organizationApi.create({ name: generateTestName() }),
      ]);
      const organizationRole = await organizationApi.roleApi.create({
        name: generateTestName(),
        type: RoleType.User,
      });

      await Promise.all([
        assignUsersToRole([user.id], userRole.id),
        organizationApi.addUsers(organization.id, [user.id]),
        organizationApi.addUsers(organizationWithRole.id, [user.id]),
      ]);
      await organizationApi.addUserRoles(organizationWithRole.id, user.id, [organizationRole.id]);

      await expect(getApplication(application.id)).resolves.toMatchObject({
        appLevelAccessControlEnabled: false,
      });
      await expect(getApplicationAccessControl(application.id)).resolves.toEqual(
        createDefaultApplicationAccessControl()
      );

      const expectedAccessControl = buildAccessControl({
        userIds: [user.id],
        userRoleIds: [userRole.id],
        organizationIds: [organization.id],
        organizationRoleRules: [
          {
            organizationId: organizationWithRole.id,
            organizationRoleIds: [organizationRole.id],
          },
        ],
      });

      await expect(
        replaceApplicationAccessControl(application.id, {
          userIds: [user.id, user.id],
          userRoleIds: [userRole.id, userRole.id],
          organizationIds: [organization.id, organization.id],
          organizationRoleRules: [
            {
              organizationId: organizationWithRole.id,
              organizationRoleIds: [organizationRole.id, organizationRole.id],
            },
            {
              organizationId: organizationWithRole.id,
              organizationRoleIds: [organizationRole.id],
            },
          ],
        })
      ).resolves.toEqual(expectedAccessControl);
      await expect(getApplicationAccessControl(application.id)).resolves.toEqual(
        expectedAccessControl
      );

      await updateApplication(application.id, { appLevelAccessControlEnabled: true });
      await expect(getApplication(application.id)).resolves.toMatchObject({
        appLevelAccessControlEnabled: true,
      });
    } finally {
      await Promise.allSettled([
        deleteApplication(application.id),
        deleteDefaultTenantUser(user.id),
        deleteRole(userRole.id),
        organizationApi.cleanUp(),
      ]);
    }
  });

  it('rejects enabling app-level access control without any rules', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.SPA);

    try {
      const response = await authedAdminApi.patch(`applications/${application.id}`, {
        json: { appLevelAccessControlEnabled: true },
        throwHttpErrors: false,
      });

      expect(response.status).toBe(422);
      await expect(response.json()).resolves.toMatchObject({
        code: 'request.invalid_input',
      });
    } finally {
      await deleteApplication(application.id);
    }
  });

  it('saves and enables every rule type for each supported user-facing application type', async () => {
    const applications = await createApplicationMatrix();
    const ruleMatrix = await createRuleMatrix();

    try {
      for (const application of applications) {
        for (const { accessControl } of ruleMatrix.rules) {
          // eslint-disable-next-line no-await-in-loop
          await expect(
            replaceApplicationAccessControl(application.id, accessControl)
          ).resolves.toEqual(accessControl);
          // eslint-disable-next-line no-await-in-loop
          await application.updateEnabled(true);
          // eslint-disable-next-line no-await-in-loop
          await expect(getApplicationAccessControl(application.id)).resolves.toEqual(accessControl);
        }

        const expectedApplication =
          application.type === ApplicationType.SAML
            ? getSamlApplication(application.id)
            : getApplication(application.id);
        const expectedProperties =
          application.type === ApplicationType.SAML
            ? { appLevelAccessControlEnabled: true }
            : {
                type: application.type,
                isThirdParty: application.isThirdParty ?? false,
                appLevelAccessControlEnabled: true,
              };

        // eslint-disable-next-line no-await-in-loop
        await expect(expectedApplication).resolves.toMatchObject(expectedProperties);
      }
    } finally {
      await Promise.allSettled([
        ...applications.map(async ({ cleanup }) => cleanup()),
        ruleMatrix.cleanup(),
      ]);
    }
  });

  it('rejects invalid rule references and non-user role types on save', async () => {
    const organizationApi = new OrganizationApiTest();
    const application = await createApplication(generateTestName(), ApplicationType.SPA);
    const nonUserRole = await createRole({ type: RoleType.MachineToMachine });

    try {
      const organization = await organizationApi.create({ name: generateTestName() });
      const nonUserOrganizationRole = await organizationApi.roleApi.create({
        name: generateTestName(),
        type: RoleType.MachineToMachine,
      });

      await expectPutApplicationAccessControlError(
        application.id,
        buildAccessControl({ userIds: [missingId()] }),
        404,
        'entity.relation_foreign_key_not_found'
      );
      await expectPutApplicationAccessControlError(
        application.id,
        buildAccessControl({ organizationIds: [missingId()] }),
        404,
        'entity.relation_foreign_key_not_found'
      );
      await expectPutApplicationAccessControlError(
        application.id,
        buildAccessControl({ userRoleIds: [missingId()] }),
        404,
        'entity.relation_foreign_key_not_found'
      );
      await expectPutApplicationAccessControlError(
        application.id,
        buildAccessControl({ userRoleIds: [nonUserRole.id] }),
        422,
        'entity.db_constraint_violated'
      );
      await expectPutApplicationAccessControlError(
        application.id,
        buildAccessControl({
          organizationRoleRules: [
            {
              organizationId: organization.id,
              organizationRoleIds: [missingId()],
            },
          ],
        }),
        404,
        'entity.relation_foreign_key_not_found'
      );
      await expectPutApplicationAccessControlError(
        application.id,
        buildAccessControl({
          organizationRoleRules: [
            {
              organizationId: organization.id,
              organizationRoleIds: [nonUserOrganizationRole.id],
            },
          ],
        }),
        422,
        'entity.db_constraint_violated'
      );
      await expectPutApplicationAccessControlError(
        application.id,
        buildAccessControl({
          organizationRoleRules: [
            {
              organizationId: organization.id,
              organizationRoleIds: [],
            },
          ],
        }),
        422,
        'request.invalid_input'
      );
    } finally {
      await Promise.allSettled([
        deleteApplication(application.id),
        deleteRole(nonUserRole.id),
        organizationApi.cleanUp(),
      ]);
    }
  });
});
