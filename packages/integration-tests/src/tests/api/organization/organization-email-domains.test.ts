import { generateStandardId } from '@logto/shared';

import { OrganizationApiTest } from '#src/helpers/organization.js';

const randomId = () => generateStandardId(6);

describe('organization email domains', () => {
  const organizationApi = new OrganizationApiTest();

  afterEach(async () => {
    await organizationApi.cleanUp();
  });

  it('should add and delete email domains', async () => {
    const organization = await organizationApi.create({ name: 'foo' });
    const emailDomain = `${randomId()}.com`;

    await organizationApi.addEmailDomain(organization.id, emailDomain);
    await expect(organizationApi.getEmailDomains(organization.id)).resolves.toMatchObject([
      { emailDomain },
    ]);

    await organizationApi.deleteEmailDomain(organization.id, emailDomain);
    await expect(organizationApi.getEmailDomains(organization.id)).resolves.toEqual([]);
  });

  it('should have default pagination', async () => {
    const organization = await organizationApi.create({ name: 'foo' });

    const emailDomains = Array.from({ length: 30 }, () => `${randomId()}.com`);

    await organizationApi.replaceEmailDomains(organization.id, emailDomains);

    const emailDomainsPage1 = await organizationApi.getEmailDomains(organization.id);
    const emailDomainsPage2 = await organizationApi.getEmailDomains(organization.id, 2);

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
      organizationApi.deleteEmailDomain(organization.id, emailDomain)
    ).rejects.toMatchInlineSnapshot('[HTTPError: Request failed with status code 404 Not Found]');
  });

  it('should return 400 when adding an email domain that already exists', async () => {
    const organization = await organizationApi.create({ name: 'foo' });
    const emailDomain = `${randomId()}.com`;

    await organizationApi.addEmailDomain(organization.id, emailDomain);
    await expect(
      organizationApi.addEmailDomain(organization.id, emailDomain)
    ).rejects.toMatchInlineSnapshot(
      '[HTTPError: Request failed with status code 422 Unprocessable Entity]'
    );
  });

  it('should be able to replace email domains', async () => {
    const organization = await organizationApi.create({ name: 'foo' });
    await organizationApi.addEmailDomain(organization.id, `${randomId()}.com`);

    const emailDomains = [`${randomId()}.com`, `${randomId()}.com`];

    await organizationApi.replaceEmailDomains(organization.id, emailDomains);
    await expect(organizationApi.getEmailDomains(organization.id)).resolves.toEqual(
      expect.arrayContaining(
        emailDomains.map((emailDomain) => expect.objectContaining({ emailDomain }))
      )
    );
  });
});
