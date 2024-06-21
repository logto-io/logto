import assert from 'node:assert';

import { ApplicationType, type Application } from '@logto/schemas';
import { HTTPError } from 'ky';

import {
  createApplication as createApplicationApi,
  deleteApplication,
} from '#src/api/application.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

// TODO: Remove this prefix
devFeatureTest.describe('organization application APIs', () => {
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
      expect(await organizationApi.applications.getList(organization.id)).toContainEqual(
        application
      );

      await organizationApi.applications.delete(organization.id, application.id);
      expect(await organizationApi.applications.getList(organization.id)).not.toContainEqual(
        application
      );
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
        .addApplicationRoles(organization.id, '0', [application.id])
        .catch((error: unknown) => error);
      assert(response instanceof HTTPError);
      expect(response.response.status).toBe(422);
    });

    it('should be able to add and delete organization application role', async () => {
      const organization = await organizationApi.create({ name: 'test' });
      const role = await organizationApi.roleApi.create({ name: `test-${generateTestName()}` });
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
  });
});
