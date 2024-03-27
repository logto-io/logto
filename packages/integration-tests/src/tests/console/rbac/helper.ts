import { type Page } from 'puppeteer';

import { logtoConsoleUrl } from '#src/constants.js';
import {
  expectModalWithTitle,
  expectToClickModalAction,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { selectDropdownMenuItem } from '#src/ui-helpers/select-dropdown-menu-item.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

export const expectToSelectPermissionAction = async (
  page: Page,
  { permissionName, action }: { permissionName: string; action: string }
) => {
  const permissionRow = await expect(page).toMatchElement('table tbody tr:has(td div)', {
    text: permissionName,
  });

  // Click the action button from the permission row
  await expect(permissionRow).toClick('td[class$=actionColumn] button');

  await selectDropdownMenuItem(page, 'div[role=menuitem]', action);
};

/**
 * Create a machine-to-machine role and assign permissions to it by operating on the Web
 *
 * @param page The page to run the test on
 * @param createRolePayload The payload to create the role
 * @param apiResources The list of API resources which are going to be assigned to the role
 * @param backToListingPage Whether to go back to the roles listing page after creating the role
 */
export const createM2mRoleAndAssignPermissions = async (
  page: Page,
  createRolePayload: { roleName: string; roleDescription: string },
  apiResources: Array<{ apiResourceName: string; permissionName: string }>,
  backToListingPage = false
) => {
  const { roleName, roleDescription } = createRolePayload;

  await expect(page).toClick('div[class$=headline] button span', {
    text: 'Create role',
  });

  await expectModalWithTitle(page, 'Create role');

  // Expand role type selection
  await expect(page).toClick('button[class$=roleTypeSelectionSwitch] span', {
    text: 'Show more options',
  });

  await expect(page).toClick('div[class*=radioGroup][class$=roleTypes] div[class$=content]', {
    text: 'Machine-to-machine app role',
  });

  await expect(page).toFillForm('.ReactModalPortal form', {
    name: roleName,
    description: roleDescription,
  });

  /* eslint-disable no-await-in-loop */
  for (const apiResource of apiResources) {
    const { apiResourceName, permissionName } = apiResource;
    // Assign customized permission
    await expect(page).toClick(
      '.ReactModalPortal div[class$=resourceItem] div[class$=title] div[class$=name]',
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
  }
  /* eslint-enable no-await-in-loop */

  await expectToClickModalAction(page, 'Create role');

  await waitForToast(page, {
    text: `The role ${roleName} has been successfully created.`,
  });

  await expectModalWithTitle(page, 'Assign apps');
  await expectToClickModalAction(page, 'Skip for now');

  await expect(page).toMatchElement('div[class$=header] div[class$=metadata] div[class$=name]', {
    text: roleName,
  });

  if (backToListingPage) {
    await expectNavigation(
      page.goto(appendPathname('/console/roles', new URL(logtoConsoleUrl)).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'Roles',
      }
    );
  }
};
