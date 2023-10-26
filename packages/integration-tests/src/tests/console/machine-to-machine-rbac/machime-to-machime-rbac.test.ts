import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectConfirmModalAndAct,
  expectModalWithTitle,
  expectToClickModalAction,
  goToAdminConsole,
  waitForToast,
} from '#src/ui-helpers/index.js';
import {
  expectNavigation,
  appendPathname,
  generateResourceName,
  generateResourceIndicator,
  generateScopeName,
  generateRoleName,
} from '#src/utils.js';

import {
  expectToChooseAndClickApplicationFramework,
  expectToProceedApplicationCreationFrom,
} from '../applications/helpers.js';

import { createM2mRoleAndAssignPermissions } from './utils.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('M2M RBAC', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);
  const managementApiResourceName = 'Logto Management API';
  const managementApiPermission = 'all';
  const apiResourceName = generateResourceName();
  const apiResourceIndicator = generateResourceIndicator();
  const permissionName = generateScopeName();
  const permissionDescription = 'Dummy permission description';
  const roleName = generateRoleName();
  const roleDescription = 'Dummy role description';

  const rbacTestAppname = 'm2m-app-001';
  const m2mFramework = 'Machine-to-machine';

  beforeAll(async () => {
    await goToAdminConsole();
  });

  describe('create api resource and permissions', () => {
    it('navigate to api resources page', async () => {
      await expectNavigation(
        page.goto(appendPathname('/console/api-resources', logtoConsoleUrl).href)
      );

      await expect(page).toMatchElement(
        'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
        {
          text: 'API resources',
        }
      );
    });

    it('create an api resource', async () => {
      await expect(page).toClick('div[class$=headline] button span', {
        text: 'Create API resource',
      });

      await expectModalWithTitle(page, 'Start with tutorials');

      // Click bottom button to skip tutorials
      await expect(page).toClick('.ReactModalPortal nav[class$=actionBar] button span', {
        text: 'Continue without tutorial',
      });

      await expectModalWithTitle(page, 'Create API resource');

      await expect(page).toFillForm('.ReactModalPortal form', {
        name: apiResourceName,
        indicator: apiResourceIndicator,
      });

      await expectToClickModalAction(page, 'Create API resource');

      await waitForToast(page, {
        text: `The API resource ${apiResourceName} has been successfully created`,
      });

      await expect(page).toMatchElement('div[class$=header] div[class$=metadata] div', {
        text: apiResourceName,
      });
    });

    it('create permission for api resource', async () => {
      await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
        text: 'Permissions',
      });

      await expect(page).toClick('div[class$=filter] button[class$=createButton] span', {
        text: 'Create permission',
      });

      await expectModalWithTitle(page, 'Create permission');

      await expect(page).toFillForm('.ReactModalPortal form', {
        name: permissionName,
        description: permissionDescription,
      });

      await expectToClickModalAction(page, 'Create permission');

      await waitForToast(page, {
        text: `The permission ${permissionName} has been successfully created`,
      });

      await expect(page).toMatchElement('table tbody tr td div', {
        text: permissionName,
      });
    });
  });

  describe('create m2m app', () => {
    it('navigate to applications page', async () => {
      await expectNavigation(
        page.goto(appendPathname('/console/applications', logtoConsoleUrl).href)
      );
      await expect(page).toMatchElement(
        'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
        {
          text: 'Applications',
        }
      );
    });

    it('create a m2m app for rbac testing', async () => {
      await expectToChooseAndClickApplicationFramework(page, m2mFramework);

      await expectToProceedApplicationCreationFrom(page, {
        name: rbacTestAppname,
        description: rbacTestAppname,
      });

      // Skip guide
      await page.keyboard.press('Escape');
    });
  });

  describe('create m2m role', () => {
    it('navigate to roles page', async () => {
      await expectNavigation(page.goto(appendPathname('/console/roles', logtoConsoleUrl).href));

      await expect(page).toMatchElement(
        'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
        {
          text: 'Roles',
        }
      );
    });

    it('create a m2m role and assign permissions to the role', async () => {
      await createM2mRoleAndAssignPermissions(page, { roleName, roleDescription }, [
        { apiResourceName, permissionName },
        { apiResourceName: managementApiResourceName, permissionName: managementApiPermission },
      ]);
    });

    it('delete a permission from a role on the role details page', async () => {
      await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
        text: 'Permissions',
      });

      const permissionRow = await expect(page).toMatchElement('table tbody tr:has(td div)', {
        text: permissionName,
      });
      await expect(permissionRow).toClick('td[class$=deleteColumn] button');

      await expectConfirmModalAndAct(page, {
        title: 'Reminder',
        actionText: 'Remove',
      });

      await waitForToast(page, {
        text: `The permission "${permissionName}" was successfully removed from this role`,
      });
    });

    it('assign a permission to a role on the role details page', async () => {
      // Wait for the deletion confirmation modal to disappear.
      await page.waitForSelector('.ReactModalPortal div[class$=header] div[class$=titleEllipsis]', {
        hidden: true,
      });

      await expect(page).toClick('div[class$=filter] button span', {
        text: 'Assign permissions',
      });

      await expectModalWithTitle(page, 'Assign permissions');

      await expect(page).toClick(
        '.ReactModalPortal div[class$=resourceItem] div[class$=title] div',
        {
          text: apiResourceName,
        }
      );

      await expect(page).toClick(
        '.ReactModalPortal div[class$=resourceItem] div[class$=sourceScopeItem] div[role=button]',
        {
          text: permissionName,
        }
      );

      await expectToClickModalAction(page, 'Assign permissions');

      await waitForToast(page, {
        text: 'The selected permissions were successfully assigned to this role',
      });

      await expect(page).toMatchElement('table tbody tr:has(td div)', {
        text: permissionName,
      });
    });
  });

  describe('assign a role to a m2m app (on role details page)', () => {
    it('assign a role to a m2m app on the role details page', async () => {
      await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
        text: 'Machine-to-machine apps',
      });

      await expect(page).toClick('div[class$=filter] button span', {
        text: 'Assign applications',
      });

      await expectModalWithTitle(page, 'Assign apps');

      await expect(page).toClick(
        '.ReactModalPortal div[class$=rolesTransfer] div[class$=item] div[class$=title]',
        {
          text: rbacTestAppname,
        }
      );
      await expectToClickModalAction(page, 'Assign applications');

      await waitForToast(page, {
        text: 'The selected applications were successfully assigned to this role',
      });

      await expect(page).toMatchElement(
        'div[class$=applicationsTable] td div[class$=item] a[class$=title]',
        {
          text: rbacTestAppname,
        }
      );
    });
  });

  describe('assign/remove a role to/from a m2m app (on m2m app details page)', () => {
    it('remove a role form a m2m app on the app details page', async () => {
      // Navigate to app details page
      await expect(page).toClick('table tbody tr td a[class$=title]', {
        text: rbacTestAppname,
      });

      await expect(page).toMatchElement('div[class$=header] > div[class$=metadata] div', {
        text: rbacTestAppname,
      });

      // Go to roles tab
      await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
        text: 'Roles',
      });

      const roleRow = await expect(page).toMatchElement('table tbody tr:has(td a[class$=title])', {
        text: roleName,
      });

      // Click remove button
      await expect(roleRow).toClick('td:last-of-type button');

      await expectConfirmModalAndAct(page, {
        title: 'Reminder',
        actionText: 'Remove',
      });

      await waitForToast(page, {
        text: `${roleName} was successfully removed from this user.`,
      });
    });

    it('add a role to m2m app on the application details page', async () => {
      await expect(page).toClick('div[class$=filter] button span', {
        text: 'Assign roles',
      });

      await expectModalWithTitle(page, `Assign roles to ${rbacTestAppname}`);

      await expect(page).toClick(
        '.ReactModalPortal div[class$=rolesTransfer] div[class$=item] div',
        {
          text: roleName,
        }
      );

      await expectToClickModalAction(page, 'Assign roles');

      await waitForToast(page, {
        text: 'Successfully assigned role(s)',
      });
    });
  });
});
