import { ApplicationType, type Organization } from '@logto/schemas';

import {
  postApplicationUserConsentOrganization,
  getApplicationUserConsentOrganization,
  putApplicationUserConsentOrganization,
  deleteApplicationUserConsentOrganization,
} from '#src/api/application-user-consent-organization.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { OrganizationApi } from '#src/api/organization.js';
import { expectRejects } from '#src/helpers/index.js';
import { UserApiTest } from '#src/helpers/user.js';

const testPrefix = 'application-user-consent-organization';

describe('assign user consent organizations to application', () => {
  const applicationIds = new Map<string, string>();
  const organizations = new Map<string, Organization>();
  const userIds = new Map<string, string>();

  const userApiTest = new UserApiTest();
  const organizationApi = new OrganizationApi();

  beforeAll(async () => {
    const [firstPartyApp, thirdPartyApp] = await Promise.all([
      createApplication('first-party-application', ApplicationType.SPA),
      createApplication('third-party-application', ApplicationType.Traditional, {
        isThirdParty: true,
      }),
    ]);

    applicationIds.set('firstPartyApp', firstPartyApp.id);
    applicationIds.set('thirdPartyApp', thirdPartyApp.id);

    const [adminOrganization, guestOrganization] = await Promise.all([
      organizationApi.create({
        name: `${testPrefix}:admin-organization`,
      }),
      organizationApi.create({
        name: `${testPrefix}:guest-organization`,
      }),
    ]);

    organizations.set('adminOrganization', adminOrganization);
    organizations.set('guestOrganization', guestOrganization);

    const [adminUser, guestUser] = await Promise.all([
      userApiTest.create({ name: `${testPrefix}:admin-user` }),
      userApiTest.create({ name: `${testPrefix}:guest-user` }),
    ]);

    userIds.set('adminUser', adminUser.id);
    userIds.set('guestUser', guestUser.id);

    await Promise.all([
      organizationApi.addUsers(adminOrganization.id, [adminUser.id]),
      organizationApi.addUsers(guestOrganization.id, [adminUser.id, guestUser.id]),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      ...Array.from(applicationIds.values()).map(async (applicationId) =>
        deleteApplication(applicationId)
      ),
      ...Array.from(organizations.values()).map(async ({ id }) => organizationApi.delete(id)),
      userApiTest.cleanUp(),
    ]);
  });

  describe('assign user consent organizations to application', () => {
    it('should throw 404 if application not found', async () => {
      await expectRejects(
        postApplicationUserConsentOrganization('not-found', userIds.get('adminUser')!, {
          organizationIds: [],
        }),
        {
          code: 'entity.not_exists_with_id',
          status: 404,
        }
      );
    });

    it('should throw 404 if user not found', async () => {
      await expectRejects(
        postApplicationUserConsentOrganization(applicationIds.get('thirdPartyApp')!, 'not-found', {
          organizationIds: [],
        }),
        {
          code: 'entity.not_found',
          status: 404,
        }
      );
    });

    it('should throw 422 if application is not third-party', async () => {
      await expectRejects(
        postApplicationUserConsentOrganization(
          applicationIds.get('firstPartyApp')!,
          userIds.get('adminUser')!,
          {
            organizationIds: [],
          }
        ),
        {
          code: 'application.third_party_application_only',
          status: 422,
        }
      );
    });

    it('should throw 422 if user is not a member of the organization', async () => {
      await expectRejects(
        postApplicationUserConsentOrganization(
          applicationIds.get('thirdPartyApp')!,
          userIds.get('guestUser')!,
          {
            organizationIds: [organizations.get('adminOrganization')!.id],
          }
        ),
        {
          code: 'organization.require_membership',
          status: 422,
        }
      );
    });

    it('should assign user consent organizations to application', async () => {
      const applicationId = applicationIds.get('thirdPartyApp')!;
      const adminUser = userIds.get('adminUser')!;
      const adminOrganization = organizations.get('adminOrganization')!;
      const guestOrganization = organizations.get('guestOrganization')!;

      await postApplicationUserConsentOrganization(applicationId, adminUser, {
        organizationIds: [adminOrganization.id, guestOrganization.id],
      });

      const { organizations: consentOrganizations } = await getApplicationUserConsentOrganization(
        applicationId,
        adminUser
      );

      expect(consentOrganizations).toHaveLength(2);
      expect(consentOrganizations.find(({ id }) => id === adminOrganization.id)).toMatchObject(
        adminOrganization
      );
      expect(consentOrganizations.find(({ id }) => id === guestOrganization.id)).toMatchObject(
        guestOrganization
      );
    });

    it('should update user consent organizations to application', async () => {
      const applicationId = applicationIds.get('thirdPartyApp')!;
      const adminUser = userIds.get('adminUser')!;
      const adminOrganization = organizations.get('adminOrganization')!;

      await putApplicationUserConsentOrganization(applicationId, adminUser, {
        organizationIds: [adminOrganization.id],
      });

      const { organizations: consentOrganizations } = await getApplicationUserConsentOrganization(
        applicationId,
        adminUser
      );

      expect(consentOrganizations).toHaveLength(1);
      expect(consentOrganizations.find(({ id }) => id === adminOrganization.id)).toMatchObject(
        adminOrganization
      );
    });

    it('should delete user consent organizations to application', async () => {
      const applicationId = applicationIds.get('thirdPartyApp')!;
      const adminUser = userIds.get('adminUser')!;

      await putApplicationUserConsentOrganization(applicationId, adminUser, {
        organizationIds: [],
      });

      const { organizations: consentOrganizations } = await getApplicationUserConsentOrganization(
        applicationId,
        adminUser
      );

      expect(consentOrganizations).toHaveLength(0);
    });

    it('should delete a user consent organization to application by id', async () => {
      const applicationId = applicationIds.get('thirdPartyApp')!;
      const guestUser = userIds.get('guestUser')!;
      const guestOrganization = organizations.get('guestOrganization')!;

      await postApplicationUserConsentOrganization(applicationId, guestUser, {
        organizationIds: [guestOrganization.id],
      });

      const { organizations: consentOrganizations } = await getApplicationUserConsentOrganization(
        applicationId,
        guestUser
      );

      expect(consentOrganizations).toHaveLength(1);

      await deleteApplicationUserConsentOrganization(
        applicationId,
        guestUser,
        guestOrganization.id
      );

      const { organizations: consentOrganizationsAfterDelete } =
        await getApplicationUserConsentOrganization(applicationId, guestUser);

      expect(consentOrganizationsAfterDelete).toHaveLength(0);
    });
  });
});
