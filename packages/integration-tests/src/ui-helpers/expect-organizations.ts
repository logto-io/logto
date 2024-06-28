import { cls, dcls } from '#src/utils.js';

import ExpectConsole from './expect-console.js';
import { selectDropdownMenuItem } from './select-dropdown-menu-item.js';

export default class ExpectOrganizations extends ExpectConsole {
  /**
   * Go to the organizations page and create a new organization, then assert that the URL matches
   * the organization detail page.
   *
   * @param name The name of the organization to create.
   */
  async toCreateOrganization(name: string) {
    await this.gotoPage('/organizations', 'Organizations');
    await this.toClickButton('Create organization', false);

    await this.toExpectModal('Create organization');
    await this.toFillForm({
      name,
    });
    await this.toClick(['.ReactModalPortal', `button${cls('primary')}`].join(' '), 'Create');
    this.toMatchUrl(/\/organizations\/.+$/);
  }

  /**
   * Go to he organization template page and create a new organization permission,
   * then assert then assert the permission is created.
   *
   * @param param The parameters for creating the organization permission.
   * @param param.name The name of the organization permission.
   * @param param.description The description of the organization permission.
   */
  async toCreateOrganizationPermission({
    name,
    description,
  }: {
    name: string;
    description: string;
  }) {
    await this.gotoPage('/organization-template', 'Organization template');
    await this.toClickTab('Organization permissions');
    await this.toClickButton('Create organization permission', false);

    // Use fill input since no form tag is present in this modal
    await this.toExpectModal('Create organization permission');
    await this.toFillInput('name', name);
    await this.toFillInput('description', description);
    await this.toClickButton('Create permission', false);

    await this.toExpectTableCell(name);
  }

  /**
   * Go to the organization template page and create a new organization role,
   * then skip the permission assignment and  assert that the URL matches
   * the organization detail page.
   *
   * @param param The parameters for creating the organization role.
   * @param param.name The name of the organization role.
   * @param param.description The description of the organization role.
   */
  async toCreateOrganizationRole({ name, description }: { name: string; description: string }) {
    await this.gotoPage('/organization-template/organization-roles', 'Organization template');
    await this.toClickTab('Organization roles');
    await this.toClickButton('Create organization role', false);

    // Use fill input since no form tag is present in this modal
    await this.toExpectModal('Create organization role');
    await this.toFillInput('name', name);
    await this.toFillInput('description', description);
    await this.toClickButton('Create role', false);

    // Skip permission assignment
    await this.toExpectModal('Assign permissions');
    await this.toClickButton('Skip');

    this.toMatchUrl(/\/organization-template\/organization-roles\/.+$/);
  }

  /**
   * Go to the organization role details page, assign organization permissions and API permissions for an organization role,
   * then assert the permissions are assigned.
   *
   * @param param The parameters for assigning permissions for an organization role.
   * @param param.organizationPermission The name of the organization permission to assign.
   * @param param.apiPermission The API permission to assign.
   * @param param.forOrganizationRole The organization role to assign the permissions.
   */
  async toAssignPermissionsForOrganizationRole({
    organizationPermission,
    apiPermission: { resource: apiResource, permission: apiPermission },
    forOrganizationRole,
  }: {
    organizationPermission: string;
    apiPermission: {
      resource: string;
      permission: string;
    };
    forOrganizationRole: string;
  }) {
    await this.navigateToOrganizationRoleDetailsPage(forOrganizationRole);

    await this.toClickButton('Assign permissions', false);
    await this.toExpectModal('Assign permissions');
    // Select organization permission
    await this.toClickTab('Organization permissions');
    await this.toClick(`div[role=button]`, organizationPermission, false);

    // Select API permission
    await this.toClickTab('API permissions');
    await this.toClick(`div[role=button]`, apiResource, false);
    await this.toClick(`div[role=button]`, apiPermission, false);

    await this.toClickButton('Save', false);

    await this.toExpectTableCell(organizationPermission);
    await this.toExpectTableCell(apiPermission);
  }

  /**
   * Go to the organization role details page and delete an organization role,
   * then assert that the URL matches the organization roles page.
   *
   * @param name The name of the organization role to delete.
   */
  async toDeleteOrganizationRole(name: string) {
    await this.navigateToOrganizationRoleDetailsPage(name);

    // Open the dropdown menu
    await this.toClick([dcls('header'), `button${cls('withIcon')}`].join(' '), undefined, false);
    await this.toClick(`${dcls('danger')}[role=menuitem]`, 'Delete', false);
    await this.toExpectModal('Reminder');
    await this.toClick(['.ReactModalPortal', `button${cls('danger')}`].join(' '), 'Delete');
    await this.waitForToast(`Organization role ${name} was successfully deleted.`, 'success');
    this.toMatchUrl(/\/organization-template\/organization-roles$/);
  }

  /**
   * Go to the organization permissions page and delete an organization permission,
   *
   * @param name The name of the organization permission to delete.
   */
  async toDeleteOrganizationPermission(name: string) {
    await this.gotoPage('/organization-template', 'Organization template');
    await this.toClickTab('Organization permissions');
    await this.toExpectTableCell(name);

    // Open the dropdown menu from the table row
    const permissionRow = await expect(this.page).toMatchElement('table tbody tr:has(td div)', {
      text: name,
    });

    // Click the action button from the permission row
    await expect(permissionRow).toClick('td:last-of-type button');

    await selectDropdownMenuItem(this.page, 'div[role=menuitem]', 'Delete organization permission');

    await this.toExpectModal('Reminder');
    await this.toClick(['.ReactModalPortal', `button${cls('danger')}`].join(' '), 'Delete', false);
  }

  /**
   * Navigate to the organization role details page by given role name.
   *
   * @param name The name of the organization role.
   */
  private async navigateToOrganizationRoleDetailsPage(name: string) {
    await this.gotoPage('/organization-template', 'Organization template');
    await this.toClickTab('Organization roles');
    await this.toExpectTableCell(name);
    await this.toClickTableCell(name);

    // Assert in details page
    this.toMatchUrl(/\/organization-template\/organization-roles\/.+$/);
  }
}
