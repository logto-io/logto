import { pickDefault } from '@logto/shared/esm';

import { mockAdminApplicationRole, mockApplication } from '#src/__mocks__/index.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const roles = {
  findRoleById: jest.fn(),
};
const { findRoleById } = roles;

const applications = {
  findApplicationById: jest.fn(),
  countM2mApplicationsByIds: jest.fn(async () => ({ count: 1 })),
  findM2mApplicationsByIds: jest.fn(async () => [mockApplication]),
};

const applicationsRoles = {
  findFirstApplicationsRolesByRoleIdAndApplicationIds: jest.fn(),
  findApplicationsRolesByRoleId: jest.fn(),
  insertApplicationsRoles: jest.fn(),
  deleteApplicationRole: jest.fn(),
};
const {
  findFirstApplicationsRolesByRoleIdAndApplicationIds,
  findApplicationsRolesByRoleId,
  insertApplicationsRoles,
  deleteApplicationRole,
} = applicationsRoles;

const roleUserRoutes = await pickDefault(import('./role.application.js'));

const tenantContext = new MockTenant(
  undefined,
  {
    applicationsRoles,
    applications,
    roles,
  },
  undefined,
  { quota: createMockQuotaLibrary() }
);

describe('role application routes', () => {
  const roleUserRequester = createRequester({ authedRoutes: roleUserRoutes, tenantContext });

  it('GET /roles/:id/applications', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminApplicationRole);
    findApplicationsRolesByRoleId.mockResolvedValueOnce([]);
    const response = await roleUserRequester.get(
      `/roles/${mockAdminApplicationRole.id}/applications`
    );
    expect(response.status).toEqual(200);
    expect(response.body[0]).toHaveProperty('id', mockApplication.id);
  });

  it('POST /roles/:id/applications', async () => {
    findRoleById.mockResolvedValueOnce(mockAdminApplicationRole);
    findFirstApplicationsRolesByRoleIdAndApplicationIds.mockResolvedValueOnce(null);
    const response = await roleUserRequester
      .post(`/roles/${mockAdminApplicationRole.id}/applications`)
      .send({
        applicationIds: [mockApplication.id],
      });
    expect(response.status).toEqual(201);
    expect(insertApplicationsRoles).toHaveBeenCalledWith([
      { id: mockId, applicationId: mockApplication.id, roleId: mockAdminApplicationRole.id },
    ]);
  });

  it('DELETE /roles/:id/applications/:applicationId', async () => {
    const response = await roleUserRequester.delete(
      `/roles/${mockAdminApplicationRole.id}/applications/${mockApplication.id}`
    );
    expect(response.status).toEqual(204);
    expect(deleteApplicationRole).toHaveBeenCalledWith(
      mockApplication.id,
      mockAdminApplicationRole.id
    );
  });
});
