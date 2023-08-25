import { ApplicationType, RoleType } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'got';

import {
  createApplication,
  getApplicationRoles,
  assignRolesToApplication,
  deleteRoleFromApplication,
  putRolesToApplication,
} from '#src/api/index.js';
import { createRole } from '#src/api/role.js';
import { expectRejects } from '#src/helpers/index.js';

describe('admin console application management (roles)', () => {
  it('should get empty list successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);

    const applicationRoles = await getApplicationRoles(application.id);
    expect(applicationRoles.length).toBe(0);
  });

  it('throw when trying to get roles of non-m2m app', async () => {
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(generateStandardId(), applicationType);

    const response = await getApplicationRoles(application.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 422).toBe(true);
  });

  it('should assign roles to app and get list successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role1 = await createRole({ type: RoleType.MachineToMachine });
    const role2 = await createRole({ type: RoleType.MachineToMachine });

    await assignRolesToApplication(application.id, [role1.id, role2.id]);
    const roles = await getApplicationRoles(application.id);
    expect(roles.length).toBe(2);
    expect(roles.find(({ id }) => id === role1.id)).toBeDefined();
    expect(roles.find(({ id }) => id === role2.id)).toBeDefined();
  });

  it('should fail when assign duplicated role to app', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role = await createRole({ type: RoleType.MachineToMachine });

    await assignRolesToApplication(application.id, [role.id]);
    await expectRejects(assignRolesToApplication(application.id, [role.id]), {
      code: 'application.role_exists',
      statusCode: 422,
    });
  });

  it('should fail when assign role to non-m2m app', async () => {
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(generateStandardId(), applicationType);
    const role = await createRole({ type: RoleType.MachineToMachine });

    await expectRejects(assignRolesToApplication(application.id, [role.id]), {
      code: 'application.invalid_type',
      statusCode: 422,
    });
  });

  it('should put roles to app successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role1 = await createRole({ type: RoleType.MachineToMachine });
    const role2 = await createRole({ type: RoleType.MachineToMachine });
    const role3 = await createRole({ type: RoleType.MachineToMachine });

    await assignRolesToApplication(application.id, [role2.id]);
    const roles = await getApplicationRoles(application.id);
    expect(roles.length).toBe(1);
    expect(roles.find(({ id }) => id === role2.id)).toBeDefined();

    await putRolesToApplication(application.id, [role1.id, role3.id]);
    const updatedRoles = await getApplicationRoles(application.id);
    expect(updatedRoles.length).toBe(2);
    expect(updatedRoles.find(({ id }) => id === role1.id)).toBeDefined();
    expect(updatedRoles.find(({ id }) => id === role3.id)).toBeDefined();
  });

  it('should delete role from app successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role1 = await createRole({ type: RoleType.MachineToMachine });
    const role2 = await createRole({ type: RoleType.MachineToMachine });

    await assignRolesToApplication(application.id, [role1.id, role2.id]);
    await deleteRoleFromApplication(application.id, role1.id);

    const roles = await getApplicationRoles(application.id);
    expect(roles.length).toBe(1);
  });

  it('should failed to delete non-existing-role from app', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role = await createRole({ type: RoleType.MachineToMachine });

    const response = await deleteRoleFromApplication(application.id, role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });
});
