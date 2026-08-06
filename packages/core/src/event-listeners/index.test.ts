import { defaultTenantId } from '@logto/schemas';

import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { addOidcEventListeners } from './index.js';

const { jest } = import.meta;

describe('addOidcEventListeners', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add proper listeners', () => {
    const provider = createMockProvider();
    const addListener = jest.spyOn(provider, 'addListener');
    addOidcEventListeners(defaultTenantId, mockEnvSet, provider, new MockQueries());
    expect(addListener).toHaveBeenCalledWith('grant.success', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('grant.error', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('grant.revoked', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('interaction.started', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('interaction.ended', expect.any(Function));
  });

  it('should register the same listener for grant success and error', () => {
    const provider = createMockProvider();
    const addListener = jest.spyOn(provider, 'addListener');
    addOidcEventListeners(defaultTenantId, mockEnvSet, provider, new MockQueries());

    const findListener = (event: string) =>
      addListener.mock.calls.find(([name]) => name === event)?.[1];

    expect(findListener('grant.success')).toBe(findListener('grant.error'));
  });
});
