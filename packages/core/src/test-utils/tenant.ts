import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { createMockProvider } from './oidc-provider.js';

const { jest } = import.meta;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const proxy: Queries = new Proxy<any>(
  {},
  {
    get() {
      return new Proxy(
        {},
        {
          get() {
            return jest.fn();
          },
        }
      );
    },
  }
);

export class MockTenant implements TenantContext {
  constructor(public provider = createMockProvider(), public queries = proxy) {}
}

export const createMockTenantWithInteraction = (interactionDetails?: jest.Mock) =>
  new MockTenant(createMockProvider(interactionDetails));
