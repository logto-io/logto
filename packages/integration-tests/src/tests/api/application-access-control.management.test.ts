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
  replaceApplicationAccessControl,
  updateApplication,
} from '#src/api/application.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
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
