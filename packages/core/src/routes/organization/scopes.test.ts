import { UniqueIntegrityConstraintViolationError } from 'slonik';

import RequestError from '#src/errors/RequestError/index.js';

import { OrganizationScopeActions } from './scopes.js';

describe('OrganizationScopeActions', () => {
  it('should throw RequestError if UniqueIntegrityConstraintViolationError is thrown inside', async () => {
    // @ts-expect-error for testing
    const actions = new OrganizationScopeActions({
      insert: async () => {
        throw new UniqueIntegrityConstraintViolationError(new Error('test'), 'unique');
      },
    });

    await expect(actions.post({ name: 'test' })).rejects.toThrowError(
      new RequestError({ code: 'entity.duplicate_value_of_unique_field', field: 'name' })
    );
  });
});
