import ExpectApiResources from '#src/ui-helpers/expect-api-resources.js';
import ExpectConsole from '#src/ui-helpers/expect-console.js';
import ExpectOrganizations from '#src/ui-helpers/expect-organizations.js';
import {
  generateResourceIndicator,
  generateResourceName,
  generateRoleName,
  generateScopeName,
} from '#src/utils.js';

const expectConsole = new ExpectConsole();
const expectApiResources = new ExpectApiResources();
const expectOrganizations = new ExpectOrganizations();

const apiResourceName = generateResourceName();
const apiResourceIndicator = generateResourceIndicator();
const apiPermissionName = generateScopeName();

const organizationPermissionName = generateScopeName();
const organizationRoleName = generateRoleName();

const dummyPermissionDescription = 'Dummy permission description';

describe('Organization RBAC', () => {
  beforeAll(async () => {
    await expectConsole.start();
  });

  it('navigates to API resources page', async () => {
    await expectApiResources.gotoPage('/api-resources', 'API resources');
    await expectApiResources.toExpectTableHeaders('API name', 'API Identifier');
  });

  it('creates an API resource', async () => {
    await expectApiResources.toCreateApiResource({
      name: apiResourceName,
      indicator: apiResourceIndicator,
    });
  });

  it('creates an API permission for organization role', async () => {
    await expectApiResources.toCreateApiResourcePermission(
      { name: apiPermissionName, description: dummyPermissionDescription },
      apiResourceName
    );
  });

  it('navigates to the organization template', async () => {
    await expectConsole.gotoPage('/organization-template', 'Organization template');
    await expectConsole.toExpectTabs('Organization roles', 'Organization permissions');
    await expectConsole.toExpectTableHeaders('Organization Role', 'Permissions');
  });

  it('creates an organization permission', async () => {
    await expectOrganizations.toCreateOrganizationPermission({
      name: organizationPermissionName,
      description: dummyPermissionDescription,
    });
  });

  it('creates an organization role', async () => {
    await expectOrganizations.toCreateOrganizationRole({
      name: organizationRoleName,
      description: dummyPermissionDescription,
    });
  });

  it('assigns organization permissions and API permissions for organization role', async () => {
    await expectOrganizations.toAssignPermissionsForOrganizationRole({
      organizationPermission: organizationPermissionName,
      apiPermission: {
        resource: apiResourceName,
        permission: apiPermissionName,
      },
      forOrganizationRole: organizationRoleName,
    });
  });

  // Clean up
  it('deletes created resources', async () => {
    // Delete created organization role
    await expectOrganizations.toDeleteOrganizationRole(organizationRoleName);

    // Delete created organization permissions
    await expectOrganizations.toDeleteOrganizationPermission(organizationPermissionName);

    // Delete created API resource
    await expectApiResources.toDeleteApiResource(apiResourceName);
  });
});
