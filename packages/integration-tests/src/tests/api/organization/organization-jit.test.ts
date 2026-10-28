import { type SsoConnector } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'ky';

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

    it('should NOT have default pagination', async () => {
      const organization = await organizationApi.create({ name: 'foo' });

      const emailDomains = Array.from({ length: 30 }, () => `${randomId()}.com`);

      await organizationApi.jit.replaceEmailDomains(organization.id, emailDomains);

      const emailDomainsPage = await organizationApi.jit.getEmailDomains(organization.id);

      expect(emailDomainsPage).toHaveLength(30);
    });

    it('should apply pagination when specified', async () => {
      const organization = await organizationApi.create({ name: 'foo' });

      const emailDomains = Array.from({ length: 30 }, () => `${randomId()}.com`);
      await organizationApi.jit.replaceEmailDomains(organization.id, emailDomains);

      const pageSize = 20;
      const page1 = await organizationApi.jit.getEmailDomains(organization.id, 1, pageSize);
      const page2 = await organizationApi.jit.getEmailDomains(organization.id, 2, pageSize);

      expect(page1).toHaveLength(pageSize);
      expect(page2).toHaveLength(emailDomains.length - pageSize);
      expect(page1.concat(page2)).toEqual(
        expect.arrayContaining(
          emailDomains.map((emailDomain) => expect.objectContaining({ emailDomain }))
        )
      );
    });

    it('should list the organizations that have an email domain', async () => {
      const emailDomain = `${randomId()}.com`;
      const [organization1, organization2, other] = await Promise.all([
        organizationApi.create({ name: 'foo' }),
        organizationApi.create({ name: 'bar' }),
        organizationApi.create({ name: 'baz' }),
      ]);
      await Promise.all([
        organizationApi.jit.replaceEmailDomains(organization1.id, [emailDomain]),
        organizationApi.jit.replaceEmailDomains(organization2.id, [
          emailDomain,
          `${randomId()}.com`,
        ]),
        organizationApi.jit.replaceEmailDomains(other.id, [`${randomId()}.com`]),
      ]);

      const organizations = await organizationApi.getList(
        new URLSearchParams({ jitEmailDomain: emailDomain })
      );
      expect(organizations.map(({ id }) => id)).toHaveLength(2);
      expect(organizations.map(({ id }) => id)).toEqual(
        expect.arrayContaining([organization1.id, organization2.id])
      );
      expect(organizations).toContainEqual(organization1);

      await expect(
        organizationApi.getList(new URLSearchParams({ jitEmailDomain: `${randomId()}.com` }))
      ).resolves.toEqual([]);
    });

    it('should paginate the organizations that have an email domain', async () => {
      const emailDomain = `${randomId()}.com`;
      const organizations = await Promise.all(
        Array.from({ length: 3 }, async () => organizationApi.create({ name: 'foo' }))
      );
      await Promise.all(
        organizations.map(async ({ id }) => organizationApi.jit.addEmailDomain(id, emailDomain))
      );

      const page1 = await organizationApi.getList(
        new URLSearchParams({ jitEmailDomain: emailDomain, page: '1', page_size: '2' })
      );
      const page2 = await organizationApi.getList(
        new URLSearchParams({ jitEmailDomain: emailDomain, page: '2', page_size: '2' })
      );

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
      expect(page1.concat(page2).map(({ id }) => id)).toEqual(
        expect.arrayContaining(organizations.map(({ id }) => id))
      );
    });

    it('should return 400 when filtering by email domain and `q` at the same time', async () => {
      const response = await organizationApi
        .getList(new URLSearchParams({ jitEmailDomain: `${randomId()}.com`, q: 'foo' }))
        .catch((error: unknown) => error);

      expect(response instanceof HTTPError && response.response.status).toBe(400);
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
