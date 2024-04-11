import { type Scope } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { createResource, deleteResource } from '#src/api/resource.js';
import { createScope, deleteScope } from '#src/api/scope.js';

export class ScopeApiTest {
  #scopes: Scope[] = [];
  #resourceId?: string;

  /**
   * Initialize the resource, scopes will be created under this resource.
   */
  async initResource(): Promise<void> {
    const resource = await createResource();
    this.#resourceId = resource.id;
  }

  get scopes(): Scope[] {
    return this.#scopes;
  }

  async create(data: { name: string }): Promise<Scope> {
    if (!this.#resourceId) {
      throw new Error('Resource is not initialized');
    }

    const created = await createScope(this.#resourceId, data.name);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.scopes.push(created);
    return created;
  }

  /**
   * Delete all created scopes and the resource. This method will ignore errors when deleting scopes to avoid error
   * when they are deleted by other tests.
   */
  async cleanUp(): Promise<void> {
    // Use `trySafe` to avoid error when scope is deleted by other tests.
    await Promise.all(
      this.scopes.map(
        async (scope) => this.#resourceId && trySafe(deleteScope(this.#resourceId, scope.id))
      )
    );
    this.#scopes = [];

    await trySafe(async () => this.#resourceId && deleteResource(this.#resourceId));
    this.#resourceId = undefined;
  }
}
