import { type Hook, InteractionHookEvent } from '@logto/schemas';

export const mockNanoIdForHook = 'random_string';

export const mockCreatedAtForHook = 1_650_969_000_000;

export const mockTenantIdForHook = 'fake_tenant';

export const mockHook: Hook = {
  tenantId: mockTenantIdForHook,
  id: mockNanoIdForHook,
  name: 'foo',
  event: null,
  events: [InteractionHookEvent.PostRegister],
  config: {
    url: 'https://example.com',
  },
  signingKey: mockNanoIdForHook,
  enabled: true,
  createdAt: mockCreatedAtForHook,
};

const mockHookData1: Hook = {
  tenantId: mockTenantIdForHook,
  id: 'hook_id_1',
  name: 'foo',
  event: null,
  events: [InteractionHookEvent.PostRegister],
  config: {
    url: 'https://example1.com',
  },
  signingKey: mockNanoIdForHook,
  enabled: true,
  createdAt: mockCreatedAtForHook,
};

const mockHookData2: Hook = {
  tenantId: mockTenantIdForHook,
  id: 'hook_id_2',
  name: 'bar',
  event: null,
  events: [InteractionHookEvent.PostResetPassword],
  config: {
    url: 'https://example2.com',
  },
  signingKey: mockNanoIdForHook,
  enabled: true,
  createdAt: mockCreatedAtForHook,
};

const mockHookData3: Hook = {
  tenantId: mockTenantIdForHook,
  id: 'hook_id_3',
  name: 'baz',
  event: null,
  events: [InteractionHookEvent.PostSignIn],
  config: {
    url: 'https://example3.com',
  },
  signingKey: mockNanoIdForHook,
  enabled: true,
  createdAt: mockCreatedAtForHook,
};

export const mockHookList: Hook[] = [mockHookData1, mockHookData2, mockHookData3];
