import { UserScope } from '@logto/core-kit';
import { ApplicationUserConsentScopeType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockResource = Object.freeze({
  id: 'resource_id',
  tenantId: 'mock_id',
  name: 'API resource',
  indicator: 'https://api.example.com',
  isDefault: false,
  accessTokenTtl: 3600,
});

const mockResourceScope = Object.freeze({
  id: 'scope_id',
  tenantId: 'mock_id',
  resourceId: mockResource.id,
  name: 'read:data',
  description: null,
  createdAt: 1_785_000_000_000,
});

const cimdQueries = {
  userScopes: {
    insert: jest.fn(),
    findAll: jest.fn(async () => [UserScope.Profile]),
    delete: jest.fn(),
  },
  resourceScopes: {
    insert: jest.fn(),
    findAll: jest.fn(async () => [mockResourceScope]),
    delete: jest.fn(),
  },
  organizationScopes: {
    insert: jest.fn(),
    findAll: jest.fn(async () => []),
    delete: jest.fn(),
  },
  organizationResourceScopes: {
    insert: jest.fn(),
    findAll: jest.fn(async () => []),
    delete: jest.fn(),
  },
};

const resourceQueries = {
  findResourceById: jest.fn(async () => mockResource),
};

const validateApplicationUserConsentScopes = jest.fn();

const cimdRoutes = await pickDefault(import('./cimd.js'));

describe('CIMD user consent scope routes', () => {
  const tenantContext = new MockTenant(
    undefined,
    {
      cimd: cimdQueries,
      resources: resourceQueries,
    },
    undefined,
    { applications: { validateApplicationUserConsentScopes } }
  );

  const routeRequester = createRequester({
    authedRoutes: cimdRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /cimd/user-consent-scopes', () => {
    it('returns the configured scopes grouped by resource', async () => {
      const response = await routeRequester.get('/cimd/user-consent-scopes');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        userScopes: [UserScope.Profile],
        organizationScopes: [],
        resourceScopes: [
          {
            resource: {
              id: mockResource.id,
              name: mockResource.name,
              indicator: mockResource.indicator,
            },
            scopes: [
              {
                id: mockResourceScope.id,
                name: mockResourceScope.name,
                description: mockResourceScope.description,
              },
            ],
          },
        ],
        organizationResourceScopes: [],
      });
    });
  });

  describe('POST /cimd/user-consent-scopes', () => {
    it('validates the scopes and inserts the relations', async () => {
      const response = await routeRequester
        .post('/cimd/user-consent-scopes')
        .send({ userScopes: [UserScope.Email], resourceScopes: [mockResourceScope.id] });

      expect(response.status).toEqual(201);
      expect(validateApplicationUserConsentScopes).toHaveBeenCalledWith(
        { userScopes: [UserScope.Email], resourceScopes: [mockResourceScope.id] },
        'mock_id'
      );
      expect(cimdQueries.userScopes.insert).toHaveBeenCalledWith([UserScope.Email]);
      expect(cimdQueries.resourceScopes.insert).toHaveBeenCalledWith([mockResourceScope.id]);
    });
  });

  describe('DELETE /cimd/user-consent-scopes/:scopeType/:scopeId', () => {
    it('deletes the relation for the given scope type', async () => {
      const response = await routeRequester.delete(
        `/cimd/user-consent-scopes/${ApplicationUserConsentScopeType.ResourceScopes}/${mockResourceScope.id}`
      );

      expect(response.status).toEqual(204);
      expect(cimdQueries.resourceScopes.delete).toHaveBeenCalledWith(mockResourceScope.id);
    });

    it('rejects an unknown scope type with 400', async () => {
      const response = await routeRequester.delete(
        '/cimd/user-consent-scopes/unknown-type/some-id'
      );

      expect(response.status).toEqual(400);
    });
  });
});
