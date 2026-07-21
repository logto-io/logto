// eslint-disable-next-line @silverhand/fp/no-let
let mockIsDevFeaturesEnabled = false;

jest.mock('./env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled;
  },
}));

describe('inline hook audit log event visibility', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it.each([false, true])(
    'exposes inline hook event titles when dev features are %s',
    async (isDevFeaturesEnabled) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle the mocked build-time feature flag.
      mockIsDevFeaturesEnabled = isDevFeaturesEnabled;

      const { auditLogEventTitle } = await import('./logs');

      if (isDevFeaturesEnabled) {
        expect(auditLogEventTitle).toMatchObject({
          'InlineHook.PostFirstFactorVerification':
            'Execute post first-factor verification inline hook',
          'InlineHook.PostSignIn': 'Execute post sign-in inline hook',
        });
        return;
      }

      expect(auditLogEventTitle).not.toHaveProperty('InlineHook.PostFirstFactorVerification');
      expect(auditLogEventTitle).not.toHaveProperty('InlineHook.PostSignIn');
    }
  );
});
