import { TtlCache } from '@logto/shared';
import { createMockPool, createMockQueryResult } from 'slonik';

import { WellKnownCache } from '#src/caches/well-known.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { createConnectorLibrary } from '#src/libraries/connector.js';
import Libraries from '#src/tenants/Libraries.js';
import Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { mockEnvSet } from './env-set.js';
import type { GrantMock } from './oidc-provider.js';
import { createMockProvider } from './oidc-provider.js';

export class MockWellKnownCache extends WellKnownCache {
  constructor(public ttlCache = new TtlCache<string, string>(60_000)) {
    super('mock_id', ttlCache);
  }
}

export class MockQueries extends Queries {
  constructor(queriesOverride?: Partial2<Queries>) {
    super(
      createMockPool({
        query: async (sql, values) => {
          return createMockQueryResult([]);
        },
      }),
      new MockWellKnownCache()
    );

    if (!queriesOverride) {
      return;
    }

    const overrideKey = <Key extends keyof Queries>(key: Key) => {
      this[key] = { ...this[key], ...queriesOverride[key] };
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(queriesOverride) as Array<keyof Queries>) {
      overrideKey(key);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Partial2<T> = { [key in keyof T]?: Partial<T[key]> };

export class MockTenant implements TenantContext {
  public id = 'mock_id';
  public envSet = mockEnvSet;
  public queries: Queries;
  public connectors: ConnectorLibrary;
  public libraries: Libraries;

  constructor(
    public provider = createMockProvider(),
    queriesOverride?: Partial2<Queries>,
    connectorsOverride?: Partial<ConnectorLibrary>,
    librariesOverride?: Partial2<Libraries>
  ) {
    this.queries = new MockQueries(queriesOverride);
    this.connectors = { ...createConnectorLibrary(this.queries), ...connectorsOverride };
    this.libraries = new Libraries(this.id, this.queries, this.connectors);
    this.setPartial('libraries', librariesOverride);
  }

  setPartialKey<Type extends 'queries' | 'libraries', Key extends keyof this[Type]>(
    type: Type,
    key: Key,
    value: Partial<this[Type][Key]>
  ) {
    this[type][key] = { ...this[type][key], ...value };
  }

  setPartial<Type extends 'queries' | 'libraries'>(type: Type, value?: Partial2<this[Type]>) {
    if (!value) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(value) as Array<keyof this[Type]>) {
      this.setPartialKey(type, key, { ...this[type][key], ...value[key] });
    }
  }
}

export const createMockTenantWithInteraction = (
  interactionDetails?: jest.Mock,
  Grant?: typeof GrantMock
) => new MockTenant(createMockProvider(interactionDetails, Grant));
