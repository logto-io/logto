import { ApplicationType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockAdminApplicationRole,
  mockApplication,
  mockAdminUserRole2,
  mockApplicationRole,
} from '#src/__mocks__/index.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const mockM2mApplication = { ...mockApplication, type: ApplicationType.MachineToMachine };

const applications = { findApplicationById: jest.fn(async () => mockM2mApplication) };

const roles = {
  findRolesByRoleIds: jest.fn(),
  findRoleById: jest.fn(),
  countRoles: jest.fn(async () => ({ count: 1 })),
  findRoles: jest.fn(async () => [mockAdminApplicationRole]),
};
const { findRolesByRoleIds } = roles;

const applicationsRoles = {
  findApplicationsRolesByApplicationId: jest.fn(),
  insertApplicationsRoles: jest.fn(),
  deleteApplicationRole: jest.fn(),
};
const { findApplicationsRolesByApplicationId, insertApplicationsRoles, deleteApplicationRole } =
  applicationsRoles;

const tenantContext = new MockTenant(undefined, { applicationsRoles, applications, roles });

const applicationRoleRoutes = await pickDefault(import('./application-role.js'));

describe('application role routes', () => {
  const applicationRoleRequester = createRequester({
    authedRoutes: applicationRoleRoutes,
    tenantContext,
  });

  it('GET /applications/:applicationId/roles', async () => {
    findApplicationsRolesByApplicationId.mockResolvedValueOnce([]);
    const response = await applicationRoleRequester.get(
      `/applications/${mockM2mApplication.id}/roles`
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockAdminApplicationRole]);
  });

  it('POST /applications/:applicationId/roles', async () => {
    findApplicationsRolesByApplicationId.mockResolvedValueOnce([]);
    findRolesByRoleIds.mockResolvedValueOnce([]);
    const response = await applicationRoleRequester
      .post(`/applications/${mockM2mApplication.id}/roles`)
      .send({
        roleIds: [mockAdminApplicationRole.id],
      });
    expect(response.status).toEqual(201);
    expect(insertApplicationsRoles).toHaveBeenCalledWith([
      { id: mockId, applicationId: mockM2mApplication.id, roleId: mockAdminApplicationRole.id },
    ]);
  });

  it('PUT /applications/:applicationId/roles', async () => {
    findApplicationsRolesByApplicationId.mockResolvedValueOnce([mockApplicationRole]);
    const response = await applicationRoleRequester
      .put(`/applications/${mockM2mApplication.id}/roles`)
      .send({
        roleIds: [mockAdminUserRole2.id],
      });
    expect(response.status).toEqual(200);
    expect(deleteApplicationRole).toHaveBeenCalledWith(
      mockM2mApplication.id,
      mockAdminApplicationRole.id
    );
    expect(insertApplicationsRoles).toHaveBeenCalledWith([
      { id: mockId, applicationId: mockM2mApplication.id, roleId: mockAdminUserRole2.id },
    ]);
  });

  it('DELETE /applications/:applicationId/roles/:roleId', async () => {
    const response = await applicationRoleRequester.delete(
      `/applications/${mockM2mApplication.id}/roles/${mockAdminApplicationRole.id}`
    );
    expect(response.status).toEqual(204);
    expect(deleteApplicationRole).toHaveBeenCalledWith(
      mockM2mApplication.id,
      mockAdminApplicationRole.id
    );
  });
});
