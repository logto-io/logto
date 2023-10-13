import { UniqueIntegrityConstraintViolationError } from 'slonik';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { OrganizationScopeActions } from './organization-scopes.js';

describe('OrganizationScopeActions', () => {
  it('should throw RequestError if UniqueIntegrityConstraintViolationError is thrown inside', async () => {
    const tenantContext = new MockTenant(undefined, {
      organizationScopes: {
        insert: async () => {
          throw new UniqueIntegrityConstraintViolationError(new Error('test'), 'unique');
        },
      },
    });
    const actions = new OrganizationScopeActions(tenantContext.queries.organizationScopes);

    await expect(actions.post({ name: 'test' })).rejects.toThrowError(
      new RequestError({ code: 'entity.duplicate_value_of_unique_field', field: 'name' })
    );
  });
});
