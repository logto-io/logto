import assert from 'node:assert';

import {
  ApplicationType,
  type ApplicationWithOrganizationRoles,
  type Application,
  RoleType,
} from '@logto/schemas';
import { HTTPError } from 'ky';

import {
  createApplication as createApplicationApi,
  deleteApplication,
} from '#src/api/application.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { generateTestName } from '#src/utils.js';

describe('organization application APIs', () => {
  describe('organization get applications', () => {
    const organizationApi = new OrganizationApiTest();
    const applications: Application[] = [];
    const createApplication = async (...args: Parameters<typeof createApplicationApi>) => {
      const created = await createApplicationApi(...args);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      applications.push(created);
      return created;
    };

    beforeAll(async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const createdApplications = await Promise.all(
        Array.from({ length: 30 }).map(async () =>
          createApplication(generateTestName(), ApplicationType.MachineToMachine)
        )
      );
      await organizationApi.applications.add(
        organization.id,
        createdApplications.map(({ id }) => id)
      );
    });

    afterAll(async () => {
      await Promise.all([
        organizationApi.cleanUp(),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        ...applications.map(async ({ id }) => deleteApplication(id).catch(() => {})),
      ]);
    });

    it('should be able to get organization applications with pagination', async () => {
      const organizationId = organizationApi.organizations[0]!.id;
      const fetchedApps1 = await organizationApi.applications.getList(organizationId, 1, 20);
      const fetchedApps2 = await organizationApi.applications.getList(organizationId, 2, 10);
      expect(fetchedApps2.length).toBe(10);
      expect(fetchedApps2[0]?.id).not.toBeFalsy();
      expect(fetchedApps2[0]?.id).toBe(fetchedApps1[10]?.id);
    });

    it('should be able to get organization applications with search', async () => {
      const organizationId = organizationApi.organizations[0]!.id;
      const fetchedApps = await organizationApi.applications.getList(organizationId, 1, 20, {
        q: applications[0]!.name,
      });
      expect(fetchedApps.length).toBe(1);
      expect(fetchedApps[0]!.id).toBe(applications[0]!.id);
      expect(fetchedApps[0]).toMatchObject(applications[0]!);
    });

    it('should be able to get organization applications with their roles', async () => {
      const organizationId = organizationApi.organizations[0]!.id;
      const app = applications[0]!;
      const roles = await Promise.all([
        organizationApi.roleApi.create({
          name: generateTestName(),
          type: RoleType.MachineToMachine,
        }),
        organizationApi.roleApi.create({
          name: generateTestName(),
          type: RoleType.MachineToMachine,
        }),
      ]);
      const roleIds = roles.map(({ id }) => id);
      await organizationApi.addApplicationRoles(organizationId, app.id, roleIds);

      const [fetchedApp] = await organizationApi.applications.getList(
        organizationId,
        undefined,
        undefined,
        {
          q: app.name,
        }
      );
      expect(fetchedApp).toMatchObject(app);
      expect((fetchedApp as ApplicationWithOrganizationRoles).organizationRoles).toHaveLength(2);
      expect((fetchedApp as ApplicationWithOrganizationRoles).organizationRoles).toEqual(
        expect.arrayContaining(roles.map(({ id }) => expect.objectContaining({ id })))
      );
    });
  });

  describe('organization - application relations', () => {
    const organizationApi = new OrganizationApiTest();
    const applications: Application[] = [];
    const createApplication = async (...args: Parameters<typeof createApplicationApi>) => {
      const created = await createApplicationApi(...args);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      applications.push(created);
      return created;
    };

    afterEach(async () => {
      await Promise.all([
        organizationApi.cleanUp(),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        ...applications.map(async ({ id }) => deleteApplication(id).catch(() => {})),
      ]);
    });

    it('should fail when try to add empty application list', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const response = await organizationApi.applications
        .add(organization.id, [])
        .catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(400);
    });

    it('should fail when try to add application to an organization that does not exist', async () => {
      const response = await organizationApi.applications
        .add('0', ['0'])
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
        expect.objectContaining({ code: 'entity.relation_foreign_key_not_found' })
      );
    });

    it('should be able to add and delete organization application', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const application = await createApplication(
        generateTestName(),
        ApplicationType.MachineToMachine
      );

      await organizationApi.applications.add(organization.id, [application.id]);
      expect(await organizationApi.applications.getList(organization.id)).toContainEqual({
        ...application,
        organizationRoles: [],
      });

      await organizationApi.applications.delete(organization.id, application.id);
      expect(await organizationApi.applications.getList(organization.id)).not.toContainEqual({
        ...application,
        organizationRoles: [],
      });
    });

    it('should fail when try to delete application from an organization that does not exist', async () => {
      const response = await organizationApi.applications
        .delete('0', '0')
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(404);
    });

    it('should fail when try to add application that is not machine-to-machine', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const application = await createApplication(generateTestName(), ApplicationType.Native);

      const response = await organizationApi.applications
        .add(organization.id, [application.id])
        .catch((error: unknown) => error);
      expect(response instanceof HTTPError && response.response.status).toBe(422);
    });
  });

  describe('organization - application - organization role relations', () => {
    const organizationApi = new OrganizationApiTest();
    const applications: Application[] = [];
    const createApplication = async (...args: Parameters<typeof createApplicationApi>) => {
      const created = await createApplicationApi(...args);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      applications.push(created);
      return created;
    };

    afterEach(async () => {
      await Promise.all([
        organizationApi.cleanUp(),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        ...applications.map(async ({ id }) => deleteApplication(id).catch(() => {})),
      ]);
    });

    it('should fail when try to add application to an organization role that does not exist', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const application = await createApplication(
        generateTestName(),
        ApplicationType.MachineToMachine
      );

      const response = await organizationApi
        .addApplicationRoles(organization.id, application.id, ['0'])
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
    });

    it('should be able to add and delete organization application role', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const role = await organizationApi.roleApi.create({
        name: `test-${generateTestName()}`,
        type: RoleType.MachineToMachine,
      });
      const application = await createApplication(
        generateTestName(),
        ApplicationType.MachineToMachine
      );

      await organizationApi.applications.add(organization.id, [application.id]);
      await organizationApi.addApplicationRoles(organization.id, application.id, [role.id]);
      expect(
        await organizationApi.getApplicationRoles(organization.id, application.id)
      ).toContainEqual(role);

      await organizationApi.deleteApplicationRole(organization.id, application.id, role.id);
      expect(
        await organizationApi.getApplicationRoles(organization.id, application.id)
      ).not.toContainEqual(role);
    });

    it('should fail when try to delete application role from an organization that does not exist', async () => {
      const response = await organizationApi
        .deleteApplicationRole('0', '0', '0')
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
    });

    it('should fail when try to add role that is not machine-to-machine type', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const role = await organizationApi.roleApi.create({
        name: `test-${generateTestName()}`,
        type: RoleType.User,
      });
      const application = await createApplication(
        generateTestName(),
        ApplicationType.MachineToMachine
      );
      await organizationApi.applications.add(organization.id, [application.id]);

      const response = await organizationApi
        .addApplicationRoles(organization.id, application.id, [role.id])
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
      expect(await response.response.json()).toMatchObject(
        expect.objectContaining({ code: 'entity.db_constraint_violated' })
      );
    });

    it('should be able to assign multiple roles to multiple applications', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const roles = await Promise.all(
        Array.from({ length: 30 }).map(async () =>
          organizationApi.roleApi.create({
            name: `test-${generateTestName()}`,
            type: RoleType.MachineToMachine,
          })
        )
      );
      const applications = await Promise.all(
        Array.from({ length: 3 }).map(async () =>
          createApplication(generateTestName(), ApplicationType.MachineToMachine)
        )
      );

      await organizationApi.applications.add(
        organization.id,
        applications.map(({ id }) => id)
      );
      await organizationApi.addApplicationsRoles(
        organization.id,
        applications.map(({ id }) => id),
        roles.map(({ id }) => id)
      );
      const fetchedRoles = await Promise.all(
        applications.map(async ({ id }) => organizationApi.getApplicationRoles(organization.id, id))
      );

      expect(fetchedRoles).toEqual(
        Array.from({ length: 3 }).map(() =>
          expect.arrayContaining(roles.map((role) => expect.objectContaining(role)))
        )
      );

      // Test pagination
      const fetchedRoles1 = await organizationApi.getApplicationRoles(
        organization.id,
        applications[0]!.id,
        1,
        20
      );
      const fetchedRoles2 = await organizationApi.getApplicationRoles(
        organization.id,
        applications[0]!.id,
        2,
        10
      );
      expect(fetchedRoles1).toHaveLength(20);
      expect(fetchedRoles2).toHaveLength(10);
      expect(roles).toEqual(expect.arrayContaining(fetchedRoles1));
      expect(roles).toEqual(expect.arrayContaining(fetchedRoles2));
    });
  });
});
