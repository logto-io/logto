import { ApplicationType, RoleType } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'got';

import { createApplication } from '#src/api/index.js';
import {
  assignApplicationsToRole,
  createRole,
  deleteApplicationFromRole,
  getRoles,
  getRoleApplications,
} from '#src/api/role.js';

describe('roles applications', () => {
  it('should get role applications successfully and get roles correctly (specifying exclude application)', async () => {
    const role = await createRole({ type: RoleType.MachineToMachine });
    const m2mApp = await createApplication(generateStandardId(), ApplicationType.MachineToMachine);
    await assignApplicationsToRole([m2mApp.id], role.id);
    const applications = await getRoleApplications(role.id);

    expect(applications.length).toBe(1);
    expect(applications[0]).toHaveProperty('id', m2mApp.id);

    const allRolesWithoutAppsRoles = await getRoles({ excludeApplicationId: m2mApp.id });
    expect(allRolesWithoutAppsRoles.find(({ id }) => id === role.id)).toBeUndefined();
  });

  it('should return 404 if role not found', async () => {
    const response = await getRoleApplications('not-found').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should assign applications to role successfully', async () => {
    const role = await createRole({ type: RoleType.MachineToMachine });
    const m2mApp1 = await createApplication(generateStandardId(), ApplicationType.MachineToMachine);
    const m2mApp2 = await createApplication(generateStandardId(), ApplicationType.MachineToMachine);
    await assignApplicationsToRole([m2mApp1.id, m2mApp2.id], role.id);
    const applications = await getRoleApplications(role.id);

    expect(applications.length).toBe(2);
  });

  it('should fail when try to assign empty applications', async () => {
    const role = await createRole({ type: RoleType.MachineToMachine });
    const response = await assignApplicationsToRole([], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(400);
  });

  it('should fail with invalid application input', async () => {
    const role = await createRole({ type: RoleType.MachineToMachine });
    const response = await assignApplicationsToRole([''], role.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(400);
  });

  it('should fail if role not found', async () => {
    const m2mApp = await createApplication(generateStandardId(), ApplicationType.MachineToMachine);
    const response = await assignApplicationsToRole([m2mApp.id], 'not-found').catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should fail if application not found', async () => {
    const role = await createRole({ type: RoleType.MachineToMachine });
    const response = await assignApplicationsToRole(['not-found'], role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should remove application from role successfully', async () => {
    const role = await createRole({ type: RoleType.MachineToMachine });
    const m2mApp = await createApplication(generateStandardId(), ApplicationType.MachineToMachine);
    await assignApplicationsToRole([m2mApp.id], role.id);
    const applications = await getRoleApplications(role.id);
    expect(applications.length).toBe(1);

    await deleteApplicationFromRole(m2mApp.id, role.id);

    const newApplications = await getRoleApplications(role.id);
    expect(newApplications.length).toBe(0);
  });

  it('should fail if role not found when trying to remove application from role', async () => {
    const m2mApp = await createApplication(generateStandardId(), ApplicationType.MachineToMachine);
    const response = await deleteApplicationFromRole(m2mApp.id, 'not-found').catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should fail if application not found when trying to remove application from role', async () => {
    const role = await createRole({ type: RoleType.MachineToMachine });
    const response = await deleteApplicationFromRole('not-found', role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });
});
