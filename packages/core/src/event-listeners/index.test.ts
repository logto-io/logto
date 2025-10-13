import { defaultTenantId } from '@logto/schemas';

import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { grantListener, grantRevocationListener } from './grant.js';
import { addOidcEventListeners } from './index.js';
import { interactionEndedListener, interactionStartedListener } from './interaction.js';

const { jest } = import.meta;

describe('addOidcEventListeners', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add proper listeners', () => {
    const provider = createMockProvider();
    const addListener = jest.spyOn(provider, 'addListener');
    addOidcEventListeners(defaultTenantId, provider, new MockQueries());
    expect(addListener).toHaveBeenCalledWith('grant.success', grantListener);
    expect(addListener).toHaveBeenCalledWith('grant.error', grantListener);
    expect(addListener).toHaveBeenCalledWith('grant.revoked', grantRevocationListener);
    expect(addListener).toHaveBeenCalledWith('interaction.started', interactionStartedListener);
    expect(addListener).toHaveBeenCalledWith('interaction.ended', interactionEndedListener);
  });
});
