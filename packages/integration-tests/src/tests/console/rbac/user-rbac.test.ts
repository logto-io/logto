import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectConfirmModalAndAct,
  expectModalWithTitle,
  expectToClickDetailsPageOption,
  expectToClickModalAction,
  expectToClickNavTab,
  goToAdminConsole,
  waitForToast,
} from '#src/ui-helpers/index.js';
import {
  expectNavigation,
  appendPathname,
  generateUsername,
  generateResourceName,
  generateResourceIndicator,
  generateScopeName,
  generateRoleName,
  cls,
} from '#src/utils.js';

import { expectToSelectPermissionAction } from './helper.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('User RBAC', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);
  const apiResourceName = generateResourceName();
  const apiResourceIndicator = generateResourceIndicator();
  const permissionName = generateScopeName();
  const permissionDescription = 'Dummy permission description';
  const roleName = generateRoleName();
  const roleDescription = 'Dummy role description';
  const rbacTestUsername = generateUsername();

  beforeAll(async () => {
    await goToAdminConsole();
  });

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

  it('create api permissions', async () => {
    await expect(page).toClick('nav div[class$=item] div[class*=link] a', {
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

  it('be able to edit the permission description', async () => {
    await expectToSelectPermissionAction(page, { permissionName, action: 'Edit permission' });
    await expectModalWithTitle(page, 'Edit API permission');
    const newDescription = `New: ${permissionDescription}`;
    await expect(page).toFillForm('.ReactModalPortal form', { description: newDescription });
    await expect(page).toClick('.ReactModalPortal button[type=submit]');
    await waitForToast(page, { text: 'Permission updated.', type: 'success' });
    await expect(page).toMatchElement('table tbody tr td div', {
      text: newDescription,
    });
  });

  it('navigate to user management page', async () => {
    await expectNavigation(page.goto(appendPathname('/console/users', logtoConsoleUrl).href));
    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'User management',
      }
    );
  });

  it('create a user for rbac testing', async () => {
    await expect(page).toClick('div[class$=headline] button span', { text: 'Add user' });

    await expectModalWithTitle(page, 'Add user');

    await expect(page).toFillForm('.ReactModalPortal form', {
      username: rbacTestUsername,
    });

    await expectToClickModalAction(page, 'Add user');

    await expectModalWithTitle(page, 'This user has been successfully created');

    await page.keyboard.press('Escape');
  });

  it('navigate to roles page', async () => {
    await expectNavigation(page.goto(appendPathname('/console/roles', logtoConsoleUrl).href));

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'Roles',
      }
    );
  });

  it('create a role and assign permissions to the role', async () => {
    await expect(page).toClick('div[class$=headline] button span', {
      text: 'Create role',
    });

    await expectModalWithTitle(page, 'Create role');

    await expect(page).toFillForm('.ReactModalPortal form', {
      name: roleName,
      description: roleDescription,
    });

    // Assign permission
    await expect(page).toClick('.ReactModalPortal div[class$=resourceItem] div[class$=title] div', {
      text: apiResourceName,
    });

    await expect(page).toClick(
      '.ReactModalPortal div[class$=resourceItem] div[class$=sourceScopeItem] div[role=button]',
      {
        text: permissionName,
      }
    );

    await expectToClickModalAction(page, 'Create role');

    await waitForToast(page, {
      text: `The role ${roleName} has been successfully created.`,
    });

    await expectModalWithTitle(page, 'Assign users');
    await expectToClickModalAction(page, 'Skip for now');

    await expect(page).toMatchElement('div[class$=header] div[class$=metadata] div', {
      text: roleName,
    });
  });

  it('delete a permission from a role on the role details page', async () => {
    await expectToClickNavTab(page, 'Permissions');

    await expectToSelectPermissionAction(page, {
      permissionName,
      action: 'Remove permission',
    });

    await expectConfirmModalAndAct(page, {
      title: 'Reminder',
      actionText: 'Remove',
    });

    await waitForToast(page, {
      text: `The permission "${permissionName}" was successfully removed from this role`,
    });
  });

  it('assign a permission to a role on the role details page', async () => {
    await expect(page).toClick('div[class$=filter] button span', {
      text: 'Assign permissions',
    });

    await expectModalWithTitle(page, 'Assign permissions');

    await expect(page).toClick('.ReactModalPortal div[class$=resourceItem] div[class$=title] div', {
      text: apiResourceName,
    });

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

  it('assign a role to a user on the role details page', async () => {
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Users',
    });

    await expect(page).toClick('div[class$=filter] button span', {
      text: 'Assign users',
    });

    await expectModalWithTitle(page, 'Assign users');

    await expect(page).toClick(
      '.ReactModalPortal div[class$=rolesTransfer] div[class$=item] div[class$=title]',
      {
        text: rbacTestUsername,
      }
    );
    await expectToClickModalAction(page, 'Assign users');

    await waitForToast(page, {
      text: 'The selected users were successfully assigned to this role',
    });

    await expect(page).toMatchElement(
      `div[class$=usersTable] td div[class$=item] a${cls('title')}`,
      {
        text: rbacTestUsername,
      }
    );
  });

  it('remove a role form a user on the user details page', async () => {
    // Navigate to user details page
    await expect(page).toClick(`table tbody tr td a${cls('title')}`, {
      text: rbacTestUsername,
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=name]', {
      text: rbacTestUsername,
    });

    // Go to roles tab
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Roles',
    });

    const roleRow = await expect(page).toMatchElement(`table tbody tr:has(td a${cls('title')})`, {
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

  it('add a role to a user on the user details page', async () => {
    await expect(page).toClick('div[class$=filter] button span', {
      text: 'Assign roles',
    });

    await expectModalWithTitle(page, `Assign roles to ${rbacTestUsername}`);

    await expect(page).toClick('.ReactModalPortal div[class$=rolesTransfer] div[class$=item] div', {
      text: roleName,
    });

    await expectToClickModalAction(page, 'Assign roles');

    await waitForToast(page, {
      text: 'Successfully assigned role(s)',
    });
  });

  // Clean up
  it('delete the test user', async () => {
    await expectToClickDetailsPageOption(page, 'Delete');
    await expectConfirmModalAndAct(page, {
      title: 'Reminder',
      actionText: 'Delete',
    });

    await waitForToast(page, {
      text: 'The user has been successfully deleted',
    });

    expect(page.url()).toBe(new URL(`console/users`, logtoConsoleUrl).href);
  });

  it('delete the role', async () => {
    await expectNavigation(page.goto(appendPathname('/console/roles', logtoConsoleUrl).href));

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'Roles',
      }
    );

    await expect(page).toClick(['table', 'tbody', 'tr', 'td', `a${cls('title')}`].join(' '), {
      text: roleName,
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=metadata] div', {
      text: roleName,
    });

    await expectToClickDetailsPageOption(page, 'Delete');
    await expectConfirmModalAndAct(page, {
      title: 'Reminder',
      actionText: 'Delete',
    });

    await waitForToast(page, {
      text: `${roleName} was successfully deleted`,
    });

    expect(page.url()).toBe(new URL(`console/roles`, logtoConsoleUrl).href);
  });

  it('delete permission', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/api-resources', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'API resources',
      }
    );

    await expect(page).toClick(['table', 'tbody', 'tr', 'td', `a${cls('title')}`].join(' '), {
      text: apiResourceName,
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=metadata] div', {
      text: apiResourceName,
    });

    // Navigate to permissions tab
    await expectToClickNavTab(page, 'Permissions');

    await expectToSelectPermissionAction(page, {
      permissionName,
      action: 'Delete permission',
    });

    await expectConfirmModalAndAct(page, {
      title: 'Reminder',
      actionText: 'Delete',
    });

    await waitForToast(page, {
      text: `The permission "${permissionName}" was successfully deleted.`,
    });
  });

  it('delete api resource', async () => {
    await expectToClickDetailsPageOption(page, 'Delete');

    await expectModalWithTitle(page, 'Reminder');

    await expect(page).toFill('.ReactModalPortal input', apiResourceName);

    await expectToClickModalAction(page, 'Delete');

    await waitForToast(page, {
      text: `The API resource ${apiResourceName} has been successfully deleted`,
    });

    expect(page.url()).toBe(new URL(`console/api-resources`, logtoConsoleUrl).href);
  });
});
