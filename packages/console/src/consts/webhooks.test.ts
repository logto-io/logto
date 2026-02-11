import { InteractionHookEvent } from '@logto/schemas';

describe('webhook event visibility', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('includes adaptive MFA hook event when dev features are enabled', async () => {
    jest.doMock('./env', () => ({
      isDevFeaturesEnabled: true,
    }));

    const { interactionHookEvents } = await import('./webhooks');

    expect(interactionHookEvents).toContain(InteractionHookEvent.PostSignInAdaptiveMfaTriggered);
  });

  it('hides adaptive MFA hook event when dev features are disabled', async () => {
    jest.doMock('./env', () => ({
      isDevFeaturesEnabled: false,
    }));

    const { interactionHookEvents } = await import('./webhooks');

    expect(interactionHookEvents).not.toContain(
      InteractionHookEvent.PostSignInAdaptiveMfaTriggered
    );
  });
});
