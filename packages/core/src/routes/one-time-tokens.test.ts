import {
  type CreateOneTimeToken,
  Organizations,
  OneTimeTokenStatus,
  RoleType,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import { mockIdGenerators } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

await mockIdGenerators();

const mockOrganization = Organizations.guard.parse({
  id: 'organization-id',
  tenantId: 'mock_id',
  name: 'Test organization',
  description: null,
  customData: {},
  isMfaRequired: false,
  isTrustedDeviceAllowed: true,
  color: {},
  branding: {},
  customCss: null,
  createdAt: 0,
});

const findByIds = jest.fn(async () => [mockOrganization]);
const findRolesByIds = jest.fn(async () => [
  { id: 'role-id', type: RoleType.User, tenantId: 'mock_id', name: 'Role', description: null },
]);
const insertOneTimeToken = jest.fn(async (data: CreateOneTimeToken) => ({
  ...data,
  tenantId: 'mock_id',
  context: data.context ?? {},
  status: OneTimeTokenStatus.Active,
  createdAt: Date.now(),
}));
const updateExpiredOneTimeTokensStatusByEmail = jest.fn();
const routes = await pickDefault(import('./one-time-tokens.js'));
const tenantContext = new MockTenant(undefined, {
  organizations: {
    findByIds,
  },
  oneTimeTokens: { insertOneTimeToken, updateExpiredOneTimeTokensStatusByEmail },
});
jest
  .spyOn(tenantContext.queries.organizations.roles, 'findByIds')
  .mockImplementation(findRolesByIds);
const requester = createRequester({
  authedRoutes: routes,
  tenantContext,
  middlewares: [koaI18next(), koaErrorHandler()],
});

const createToken = async (context?: CreateOneTimeToken['context']) =>
  requester.post('/one-time-tokens').send({ email: 'foo@example.com', context });

describe('one-time token organization validation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([undefined, {}, { jitOrganizationIds: [] }])(
    'does not query organizations when no IDs are provided: %p',
    async (context) => {
      const response = await createToken(context);
      expect(response.status).toBe(201);
      expect(findByIds).not.toHaveBeenCalled();
    }
  );

  it('accepts existing organizations and queries distinct IDs', async () => {
    const response = await createToken({
      jitOrganizationIds: [mockOrganization.id, mockOrganization.id],
    });

    expect(response.status).toBe(201);
    expect(findByIds).toHaveBeenCalledWith([mockOrganization.id]);
  });

  it.each([
    { withRoles: false, organizationIds: ['missing-org'] },
    { withRoles: true, organizationIds: ['missing-org'] },
    { withRoles: false, organizationIds: [mockOrganization.id, 'missing-org'] },
    { withRoles: true, organizationIds: [mockOrganization.id, 'missing-org'] },
  ])('rejects missing organizations: %p', async ({ withRoles, organizationIds }) => {
    const response = await createToken({
      jitOrganizationIds: organizationIds,
      ...(withRoles && {
        jitOrganizationRoles: [{ organizationId: 'missing-org', organizationRoleIds: ['role-id'] }],
      }),
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'request.invalid_input' });
    expect(response.body.message).toContain('missing-org');
    expect(insertOneTimeToken).not.toHaveBeenCalled();
    expect(updateExpiredOneTimeTokensStatusByEmail).not.toHaveBeenCalled();
  });

  it('accepts a role assignment for an existing organization', async () => {
    const response = await createToken({
      jitOrganizationIds: [mockOrganization.id],
      jitOrganizationRoles: [
        { organizationId: mockOrganization.id, organizationRoleIds: ['role-id'] },
      ],
    });
    expect(response.status).toBe(201);
    expect(findRolesByIds).toHaveBeenCalledWith(['role-id']);
  });
});
