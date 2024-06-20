import { type SsoConnector } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { providerNames } from '#src/__mocks__/sso-connectors-mock.js';
import {
  createSsoConnector as createSsoConnectorApi,
  deleteSsoConnectorById,
} from '#src/api/sso-connector.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { randomString } from '#src/utils.js';

const randomId = () => generateStandardId(6);

describe('organization just-in-time provisioning', () => {
  const organizationApi = new OrganizationApiTest();
  const ssoConnectors: SsoConnector[] = [];
  const createSsoConnector = async (...args: Parameters<typeof createSsoConnectorApi>) => {
    const ssoConnector = await createSsoConnectorApi(...args);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    ssoConnectors.push(ssoConnector);
    return ssoConnector;
  };

  afterEach(async () => {
    await Promise.all([
      organizationApi.cleanUp(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      ssoConnectors.map(async ({ id }) => deleteSsoConnectorById(id).catch(() => {})),
    ]);
  });

  describe('email domains', () => {
    it('should add and delete email domains', async () => {
      const organization = await organizationApi.create({ name: 'foo' });
      const emailDomain = `${randomId()}.com`;

      await organizationApi.jit.addEmailDomain(organization.id, emailDomain);
      await expect(organizationApi.jit.getEmailDomains(organization.id)).resolves.toMatchObject([
        { emailDomain },
      ]);

      await organizationApi.jit.deleteEmailDomain(organization.id, emailDomain);
      await expect(organizationApi.jit.getEmailDomains(organization.id)).resolves.toEqual([]);
    });

    it('should have default pagination', async () => {
      const organization = await organizationApi.create({ name: 'foo' });

      const emailDomains = Array.from({ length: 30 }, () => `${randomId()}.com`);

      await organizationApi.jit.replaceEmailDomains(organization.id, emailDomains);

      const emailDomainsPage1 = await organizationApi.jit.getEmailDomains(organization.id);
      const emailDomainsPage2 = await organizationApi.jit.getEmailDomains(organization.id, 2);

      expect(emailDomainsPage1).toHaveLength(20);
      expect(emailDomainsPage2).toHaveLength(10);
      expect(emailDomainsPage1.concat(emailDomainsPage2)).toEqual(
        expect.arrayContaining(
          emailDomains.map((emailDomain) => expect.objectContaining({ emailDomain }))
        )
      );
    });

    it('should return 404 when deleting a non-existent email domain', async () => {
      const organization = await organizationApi.create({ name: 'foo' });
      const emailDomain = `${randomId()}.com`;

      await expect(
        organizationApi.jit.deleteEmailDomain(organization.id, emailDomain)
      ).rejects.toMatchInlineSnapshot('[HTTPError: Request failed with status code 404 Not Found]');
    });

    it('should return 422 when adding an email domain that already exists', async () => {
      const organization = await organizationApi.create({ name: 'foo' });
      const emailDomain = `${randomId()}.com`;

      await organizationApi.jit.addEmailDomain(organization.id, emailDomain);
      await expect(
        organizationApi.jit.addEmailDomain(organization.id, emailDomain)
      ).rejects.toMatchInlineSnapshot(
        '[HTTPError: Request failed with status code 422 Unprocessable Entity]'
      );
    });

    it('should be able to replace email domains', async () => {
      const organization = await organizationApi.create({ name: 'foo' });
      await organizationApi.jit.addEmailDomain(organization.id, `${randomId()}.com`);

      const emailDomains = [`${randomId()}.com`, `${randomId()}.com`];

      await organizationApi.jit.replaceEmailDomains(organization.id, emailDomains);
      await expect(organizationApi.jit.getEmailDomains(organization.id)).resolves.toEqual(
        expect.arrayContaining(
          emailDomains.map((emailDomain) => expect.objectContaining({ emailDomain }))
        )
      );
    });
  });

  describe('organization roles', () => {
    it('should add and delete organization roles', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const { id: organizationRoleId } = await organizationApi.roleApi.create({
        name: `jit-role:${randomString()}`,
      });

      await organizationApi.jit.roles.add(organization.id, [organizationRoleId]);
      await expect(organizationApi.jit.roles.getList(organization.id)).resolves.toMatchObject([
        { id: organizationRoleId },
      ]);

      await organizationApi.jit.roles.delete(organization.id, organizationRoleId);
      await expect(organizationApi.jit.roles.getList(organization.id)).resolves.toEqual([]);
    });

    it('should have no pagination', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const organizationRoles = await Promise.all(
        Array.from({ length: 30 }, async () =>
          organizationApi.roleApi.create({
            name: `jit-role:${randomString()}`,
          })
        )
      );

      await organizationApi.jit.roles.replace(
        organization.id,
        organizationRoles.map(({ id }) => id)
      );

      await expect(organizationApi.jit.roles.getList(organization.id)).resolves.toEqual(
        expect.arrayContaining(organizationRoles.map(({ id }) => expect.objectContaining({ id })))
      );
    });

    it('should return 404 when deleting a non-existent organization role', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const organizationRoleId = randomId();

      await expect(
        organizationApi.jit.roles.delete(organization.id, organizationRoleId)
      ).rejects.toMatchInlineSnapshot('[HTTPError: Request failed with status code 404 Not Found]');
    });

    it('should return 422 when adding a non-existent organization role', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const organizationRoleId = randomId();

      await expect(
        organizationApi.jit.roles.add(organization.id, [organizationRoleId])
      ).rejects.toMatchInlineSnapshot(
        '[HTTPError: Request failed with status code 422 Unprocessable Entity]'
      );
    });

    it('should do nothing when adding an organization role that already exists', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const organizationRoles = await Promise.all([
        organizationApi.roleApi.create({
          name: `jit-role:${randomString()}`,
        }),
        organizationApi.roleApi.create({
          name: `jit-role:${randomString()}`,
        }),
      ]);

      await organizationApi.jit.roles.add(organization.id, [organizationRoles[0].id]);
      await expect(
        organizationApi.jit.roles.add(organization.id, [
          organizationRoles[0].id,
          organizationRoles[1].id,
        ])
      ).resolves.toBeUndefined();
    });

    it('should be able to replace organization roles', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const organizationRoles = await Promise.all(
        Array.from({ length: 2 }, async () =>
          organizationApi.roleApi.create({
            name: `jit-role:${randomString()}`,
          })
        )
      );

      await organizationApi.jit.roles.replace(
        organization.id,
        organizationRoles.map(({ id }) => id)
      );
      await expect(organizationApi.jit.roles.getList(organization.id)).resolves.toEqual(
        expect.arrayContaining(organizationRoles.map(({ id }) => expect.objectContaining({ id })))
      );
    });
  });

  describe('sso connectors', () => {
    it('should add and delete sso connectors', async () => {
      const organization = await organizationApi.create({ name: `jit-sso:${randomString()}` });
      const ssoConnector = await createSsoConnector({
        providerName: providerNames[0],
        connectorName: `My dude:${randomString()}`,
      });

      await organizationApi.jit.ssoConnectors.add(organization.id, [ssoConnector.id]);
      await expect(
        organizationApi.jit.ssoConnectors.getList(organization.id)
      ).resolves.toMatchObject([{ id: ssoConnector.id }]);

      await organizationApi.jit.ssoConnectors.delete(organization.id, ssoConnector.id);
      await expect(organizationApi.jit.ssoConnectors.getList(organization.id)).resolves.toEqual([]);
    });

    it('should have no pagination', async () => {
      const organization = await organizationApi.create({ name: `jit-sso:${randomString()}` });
      const ssoConnectors = await Promise.all(
        Array.from({ length: 30 }, async () =>
          createSsoConnector({
            providerName: providerNames[0],
            connectorName: `My dude:${randomString()}`,
          })
        )
      );

      await organizationApi.jit.ssoConnectors.replace(
        organization.id,
        ssoConnectors.map(({ id }) => id)
      );

      await expect(organizationApi.jit.ssoConnectors.getList(organization.id)).resolves.toEqual(
        expect.arrayContaining(ssoConnectors.map(({ id }) => expect.objectContaining({ id })))
      );
    });

    it('should return 404 when deleting a non-existent sso connector', async () => {
      const organization = await organizationApi.create({ name: `jit-sso:${randomString()}` });
      const ssoConnectorId = randomId();

      await expect(
        organizationApi.jit.ssoConnectors.delete(organization.id, ssoConnectorId)
      ).rejects.toMatchInlineSnapshot('[HTTPError: Request failed with status code 404 Not Found]');
    });

    it('should return 422 when adding a non-existent sso connector', async () => {
      const organization = await organizationApi.create({ name: `jit-sso:${randomString()}` });
      const ssoConnectorId = randomId();

      await expect(
        organizationApi.jit.ssoConnectors.add(organization.id, [ssoConnectorId])
      ).rejects.toMatchInlineSnapshot(
        '[HTTPError: Request failed with status code 422 Unprocessable Entity]'
      );
    });

    it('should do nothing when adding an sso connector that already exists', async () => {
      const organization = await organizationApi.create({ name: `jit-sso:${randomString()}` });
      const ssoConnector = await createSsoConnector({
        providerName: providerNames[0],
        connectorName: `My dude:${randomString()}`,
      });

      await organizationApi.jit.ssoConnectors.add(organization.id, [ssoConnector.id]);
      await expect(
        organizationApi.jit.ssoConnectors.add(organization.id, [ssoConnector.id])
      ).resolves.toBeUndefined();
    });

    it('should be able to replace sso connectors', async () => {
      const organization = await organizationApi.create({ name: `jit-sso:${randomString()}` });
      const ssoConnectors = await Promise.all(
        Array.from({ length: 2 }, async () =>
          createSsoConnector({
            providerName: providerNames[0],
            connectorName: `My dude:${randomString()}`,
          })
        )
      );

      await organizationApi.jit.ssoConnectors.replace(
        organization.id,
        ssoConnectors.map(({ id }) => id)
      );
      await expect(organizationApi.jit.ssoConnectors.getList(organization.id)).resolves.toEqual(
        expect.arrayContaining(ssoConnectors.map(({ id }) => expect.objectContaining({ id })))
      );
    });

    it('should return 422 when replacing with a non-existent sso connector', async () => {
      const organization = await organizationApi.create({ name: `jit-sso:${randomString()}` });
      const ssoConnectorId = randomId();

      await expect(
        organizationApi.jit.ssoConnectors.replace(organization.id, [ssoConnectorId])
      ).rejects.toMatchInlineSnapshot(
        '[HTTPError: Request failed with status code 422 Unprocessable Entity]'
      );
    });
  });
});
