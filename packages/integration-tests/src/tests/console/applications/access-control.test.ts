import {
  type ApplicationAccessControl,
  ApplicationType,
  createDefaultApplicationAccessControl,
  RoleType,
  type SamlApplicationResponse,
} from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import {
  createApplication,
  deleteApplication,
  getApplication,
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
import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { expectToClickModalAction, goToAdminConsole } from '#src/ui-helpers/index.js';
import { appendPathname, devFeatureTest, expectNavigation, generateTestName } from '#src/utils.js';

await page.setViewport({ width: 1920, height: 1080 });

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
      application: await response.json<SamlApplicationResponse>(),
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

const resetOrDeleteSamlApplication = async ({
  application,
  shouldDelete,
}: Awaited<ReturnType<typeof createOrReuseSamlApplication>>) => {
  if (shouldDelete) {
    await deleteSamlApplication(application.id);
    return;
  }

  await updateSamlApplication(application.id, { appLevelAccessControlEnabled: false });
  await replaceApplicationAccessControl(application.id, createDefaultApplicationAccessControl());
};

const createAccessControlFixtures = async () => {
  const organizationApi = new OrganizationApiTest();
  const { user, username } = await createDefaultTenantUserWithPassword();
  const userRole = await createRole({ name: generateTestName(), type: RoleType.User });
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

  return {
    accessControl: {
      ...createDefaultApplicationAccessControl(),
      userIds: [user.id],
      userRoleIds: [userRole.id],
      organizationIds: [organization.id],
      organizationRoleRules: [
        {
          organizationId: organizationWithRole.id,
          organizationRoleIds: [organizationRole.id],
        },
      ],
    } satisfies ApplicationAccessControl,
    tableDetails: {
      username,
      userId: user.id,
      userRoleName: userRole.name,
      organizationName: organization.name,
      organizationRoleRuleName: `${organizationWithRole.name} - ${organizationRole.name}`,
    },
    cleanup: async () =>
      Promise.allSettled([
        deleteDefaultTenantUser(user.id),
        deleteRole(userRole.id),
        organizationApi.cleanUp(),
      ]),
  };
};

const expectAccessControlTableDetails = async ({
  username,
  userId,
  userRoleName,
  organizationName,
  organizationRoleRuleName,
}: Awaited<ReturnType<typeof createAccessControlFixtures>>['tableDetails']) => {
  await expect(page).toMatchElement('table tbody tr td', { text: username });
  await expect(page).toMatchElement('table tbody tr td', { text: userId });
  await expect(page).toMatchElement('table tbody tr td', { text: userRoleName });
  await expect(page).toMatchElement('table tbody tr td', { text: organizationName });
  await expect(page).toMatchElement('table tbody tr td', { text: organizationRoleRuleName });
};

const clickRemoveRuleByText = async (text: string) =>
  page.evaluate((targetText) => {
    const row = [...document.querySelectorAll('table tbody tr')].find((element) =>
      element.textContent.includes(targetText)
    );
    const button = row?.querySelector<HTMLButtonElement>('button[aria-label=Remove]');

    if (!button) {
      throw new Error(`Remove button for rule "${targetText}" not found`);
    }

    button.click();
  }, text);

const expectRuleNotInTable = async (text: string) =>
  page.waitForFunction(
    (targetText) =>
      [...document.querySelectorAll('table tbody tr')].every(
        (element) => !element.textContent.includes(targetText)
      ),
    {},
    text
  );

devFeatureTest.describe('application access control Console', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('renders rules tab and table details for enabled applications', async () => {
    const accessControlFixtures = await createAccessControlFixtures();
    const [application, machineToMachineApplication] = await Promise.all([
      createApplication(generateTestName(), ApplicationType.SPA),
      createApplication(generateTestName(), ApplicationType.MachineToMachine),
    ]);

    try {
      await replaceApplicationAccessControl(application.id, accessControlFixtures.accessControl);
      await updateApplication(application.id, { appLevelAccessControlEnabled: true });

      await expectNavigation(
        page.goto(
          appendPathname(
            `/console/applications/${machineToMachineApplication.id}/settings`,
            logtoConsoleUrl
          ).href
        )
      );
      await expect(page).toMatchElement('nav a', { text: 'Settings' });

      const machineToMachineRulesTabCount = await page.$$eval(
        'nav a',
        (links) => links.filter((link) => link.textContent.trim() === 'Rules').length
      );
      expect(machineToMachineRulesTabCount).toBe(0);

      await expectNavigation(
        page.goto(
          appendPathname(`/console/applications/${application.id}/rules`, logtoConsoleUrl).href
        )
      );

      await expect(page).toMatchElement('nav a', { text: 'Rules' });
      await expect(page).toMatchElement('div[class$=title]', {
        text: 'Enable app-level access control',
      });

      await expectAccessControlTableDetails(accessControlFixtures.tableDetails);

      await expect(getApplication(application.id)).resolves.toMatchObject({
        appLevelAccessControlEnabled: true,
      });
    } finally {
      await Promise.allSettled([
        deleteApplication(application.id),
        deleteApplication(machineToMachineApplication.id),
        accessControlFixtures.cleanup(),
      ]);
    }
  });

  it('renders SAML rules tab and table details for enabled applications', async () => {
    const samlApplicationFixtures = await createOrReuseSamlApplication();
    const accessControlFixtures = await createAccessControlFixtures();
    const { application: samlApplication } = samlApplicationFixtures;

    try {
      await replaceApplicationAccessControl(
        samlApplication.id,
        accessControlFixtures.accessControl
      );
      await updateSamlApplication(samlApplication.id, { appLevelAccessControlEnabled: true });

      await expectNavigation(
        page.goto(
          appendPathname(`/console/applications/${samlApplication.id}/rules`, logtoConsoleUrl).href
        )
      );

      await expect(page).toMatchElement('nav a', { text: 'Rules' });
      await expect(page).toMatchElement('div[class$=title]', {
        text: 'Enable app-level access control',
      });

      await expectAccessControlTableDetails(accessControlFixtures.tableDetails);

      await expect(getSamlApplication(samlApplication.id)).resolves.toMatchObject({
        appLevelAccessControlEnabled: true,
      });
    } finally {
      await Promise.allSettled([
        resetOrDeleteSamlApplication(samlApplicationFixtures),
        accessControlFixtures.cleanup(),
      ]);
    }
  });

  it('removes user rules from the rules tab', async () => {
    const [existingUser, { user, username }] = await Promise.all([
      createDefaultTenantUserWithPassword(),
      createDefaultTenantUserWithPassword(),
    ]);
    const application = await createApplication(generateTestName(), ApplicationType.SPA);

    try {
      await replaceApplicationAccessControl(application.id, {
        ...createDefaultApplicationAccessControl(),
        userIds: [existingUser.user.id, user.id],
      });
      await updateApplication(application.id, { appLevelAccessControlEnabled: true });

      await expectNavigation(
        page.goto(
          appendPathname(`/console/applications/${application.id}/rules`, logtoConsoleUrl).href
        )
      );

      await expect(page).toMatchElement('table tbody tr td', { text: existingUser.username });
      await expect(page).toMatchElement('table tbody tr td', { text: username });

      await clickRemoveRuleByText(existingUser.username);
      await expectToClickModalAction(page, 'Remove');
      await expectRuleNotInTable(existingUser.username);

      await expect(getApplication(application.id)).resolves.toMatchObject({
        appLevelAccessControlEnabled: true,
      });
      await expect(page).toMatchElement('table tbody tr td', { text: username });
    } finally {
      await Promise.allSettled([
        deleteApplication(application.id),
        deleteDefaultTenantUser(existingUser.user.id),
        deleteDefaultTenantUser(user.id),
      ]);
    }
  });

  it('removes user rules from the SAML rules tab', async () => {
    const [existingUser, { user, username }] = await Promise.all([
      createDefaultTenantUserWithPassword(),
      createDefaultTenantUserWithPassword(),
    ]);
    const samlApplicationFixtures = await createOrReuseSamlApplication();
    const { application: samlApplication } = samlApplicationFixtures;

    try {
      await replaceApplicationAccessControl(samlApplication.id, {
        ...createDefaultApplicationAccessControl(),
        userIds: [existingUser.user.id, user.id],
      });
      await updateSamlApplication(samlApplication.id, { appLevelAccessControlEnabled: true });

      await expectNavigation(
        page.goto(
          appendPathname(`/console/applications/${samlApplication.id}/rules`, logtoConsoleUrl).href
        )
      );

      await expect(page).toMatchElement('table tbody tr td', { text: existingUser.username });
      await expect(page).toMatchElement('table tbody tr td', { text: username });

      await clickRemoveRuleByText(existingUser.username);
      await expectToClickModalAction(page, 'Remove');
      await expectRuleNotInTable(existingUser.username);

      await expect(getSamlApplication(samlApplication.id)).resolves.toMatchObject({
        appLevelAccessControlEnabled: true,
      });
      await expect(page).toMatchElement('table tbody tr td', { text: username });
    } finally {
      await Promise.allSettled([
        resetOrDeleteSamlApplication(samlApplicationFixtures),
        deleteDefaultTenantUser(existingUser.user.id),
        deleteDefaultTenantUser(user.id),
      ]);
    }
  });
});
