import { createMockProvider } from '#src/test-utils/oidc-provider.test.js';

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
    addOidcEventListeners(provider);
    expect(addListener).toHaveBeenCalledWith('grant.success', grantListener);
    expect(addListener).toHaveBeenCalledWith('grant.error', grantListener);
    expect(addListener).toHaveBeenCalledWith('grant.revoked', grantRevocationListener);
    expect(addListener).toHaveBeenCalledWith('interaction.started', interactionStartedListener);
    expect(addListener).toHaveBeenCalledWith('interaction.ended', interactionEndedListener);
  });
});
