import { InteractionHookEvent } from '@logto/schemas';

const mockIsDevFeaturesEnabled = jest.fn(() => true);

jest.mock('@/consts/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

describe('webhook event visibility', () => {
  beforeEach(() => {
    mockIsDevFeaturesEnabled.mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('always includes the adaptive MFA hook event', async () => {
    const { interactionHookEvents } = await import('./webhooks');

    expect(interactionHookEvents).toContain(InteractionHookEvent.PostSignInAdaptiveMfaTriggered);
  });

  it('groups trusted-device events when dev features are enabled', async () => {
    const { schemaGroupedDataHookEvents } = await import('./webhooks');

    expect(schemaGroupedDataHookEvents).toContainEqual([
      'TrustedDevice',
      ['TrustedDevice.Created', 'TrustedDevice.Deleted'],
    ]);
  });

  it('hides trusted-device events from available events when dev features are disabled', async () => {
    mockIsDevFeaturesEnabled.mockReturnValue(false);
    const { availableHookEvents, schemaGroupedDataHookEvents } = await import('./webhooks');

    expect(availableHookEvents).not.toEqual(
      expect.arrayContaining(['TrustedDevice.Created', 'TrustedDevice.Deleted'])
    );
    expect(schemaGroupedDataHookEvents.map(([schema]) => schema)).not.toContain('TrustedDevice');
  });
});
