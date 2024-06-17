import { generateStandardId } from '@logto/shared';

import { OrganizationApiTest } from '#src/helpers/organization.js';
import { randomString } from '#src/utils.js';

const randomId = () => generateStandardId(6);

describe('organization just-in-time provisioning', () => {
  const organizationApi = new OrganizationApiTest();

  afterEach(async () => {
    await organizationApi.cleanUp();
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

      await organizationApi.jit.addRole(organization.id, [organizationRoleId]);
      await expect(organizationApi.jit.getRoles(organization.id)).resolves.toMatchObject([
        { id: organizationRoleId },
      ]);

      await organizationApi.jit.deleteRole(organization.id, organizationRoleId);
      await expect(organizationApi.jit.getRoles(organization.id)).resolves.toEqual([]);
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

      await organizationApi.jit.replaceRoles(
        organization.id,
        organizationRoles.map(({ id }) => id)
      );

      await expect(organizationApi.jit.getRoles(organization.id)).resolves.toEqual(
        expect.arrayContaining(organizationRoles.map(({ id }) => expect.objectContaining({ id })))
      );
    });

    it('should return 404 when deleting a non-existent organization role', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const organizationRoleId = randomId();

      await expect(
        organizationApi.jit.deleteRole(organization.id, organizationRoleId)
      ).rejects.toMatchInlineSnapshot('[HTTPError: Request failed with status code 404 Not Found]');
    });

    it('should return 422 when adding a non-existent organization role', async () => {
      const organization = await organizationApi.create({ name: `jit-role:${randomString()}` });
      const organizationRoleId = randomId();

      await expect(
        organizationApi.jit.addRole(organization.id, [organizationRoleId])
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

      await organizationApi.jit.addRole(organization.id, [organizationRoles[0].id]);
      await expect(
        organizationApi.jit.addRole(organization.id, [
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

      await organizationApi.jit.replaceRoles(
        organization.id,
        organizationRoles.map(({ id }) => id)
      );
      await expect(organizationApi.jit.getRoles(organization.id)).resolves.toEqual(
        expect.arrayContaining(organizationRoles.map(({ id }) => expect.objectContaining({ id })))
      );
    });
  });
});
