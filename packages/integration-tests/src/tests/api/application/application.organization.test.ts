import { type Application, ApplicationType } from '@logto/schemas';

import {
  createApplication as createApplicationApi,
  deleteApplication,
  getApplications,
  getOrganizations,
} from '#src/api/application.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { generateTestName } from '#src/utils.js';

describe('application organizations', () => {
  const organizationApi = new OrganizationApiTest();
  const applications: Application[] = [];
  const createApplication = async (...args: Parameters<typeof createApplicationApi>) => {
    const created = await createApplicationApi(...args);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    applications.push(created);
    return created;
  };

  beforeAll(async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    applications.push(
      await createApplication(generateTestName(), ApplicationType.MachineToMachine)
    );
    await Promise.all(
      Array.from({ length: 30 }).map(async () => {
        const organization = await organizationApi.create({ name: generateTestName() });
        await organizationApi.applications.add(organization.id, [applications[0]!.id]);
        return organization;
      })
    );
  });

  afterAll(async () => {
    await Promise.all([
      organizationApi.cleanUp(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      ...applications.map(async ({ id }) => deleteApplication(id).catch(() => {})),
    ]);
  });

  it('should get organizations by application id with or without pagination', async () => {
    const organizations1 = await getOrganizations(applications[0]!.id, 1, 30);
    const organizations2 = await getOrganizations(applications[0]!.id, 2, 10);
    const organizations3 = await getOrganizations(applications[0]!.id, 2, 20);
    const organizations4 = await getOrganizations(applications[0]!.id);

    expect(organizations1).toEqual(
      expect.arrayContaining(
        organizationApi.organizations.map((object) => expect.objectContaining(object))
      )
    );
    expect(organizations1).toHaveLength(30);
    expect(organizations2).toHaveLength(10);
    expect(organizations3).toHaveLength(10);
    expect(organizations2[0]?.id).toBe(organizations1[10]?.id);
    expect(organizations3[0]?.id).toBe(organizations1[20]?.id);
    expect(organizations4).toHaveLength(30);
    expect(organizations4).toEqual(
      expect.arrayContaining(
        organizationApi.organizations.map((object) => expect.objectContaining(object))
      )
    );
  });

  it('should be able to fetch applications by excluding an organization', async () => {
    const excludedOrganization = await organizationApi.create({ name: generateTestName() });
    const applications = await Promise.all(
      Array.from({ length: 3 }).map(async () =>
        createApplication(generateTestName(), ApplicationType.MachineToMachine)
      )
    );
    await organizationApi.applications.add(excludedOrganization.id, [applications[0]!.id]);

    const fetchedApplications = await getApplications(undefined, {
      excludeOrganizationId: excludedOrganization.id,
      page_size: '100', // Just in case
    });

    expect(fetchedApplications).not.toEqual(
      expect.arrayContaining([expect.objectContaining(applications[0]!)])
    );
    expect(fetchedApplications).toEqual(
      expect.arrayContaining([
        expect.objectContaining(applications[1]!),
        expect.objectContaining(applications[2]!),
      ])
    );
  });
});
