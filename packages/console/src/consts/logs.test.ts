// eslint-disable-next-line @silverhand/fp/no-let
let mockIsDevFeaturesEnabled = false;

jest.mock('./env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled;
  },
}));

describe('action audit log event visibility', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it.each([false, true])(
    'exposes action event titles when dev features are %s',
    async (isDevFeaturesEnabled) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle the mocked build-time feature flag.
      mockIsDevFeaturesEnabled = isDevFeaturesEnabled;

      const { auditLogEventTitle } = await import('./logs');

      if (isDevFeaturesEnabled) {
        expect(auditLogEventTitle).toMatchObject({
          'Action.PostFirstFactorVerification': 'Execute post first-factor verification action',
          'Action.PostSignIn': 'Execute post sign-in action',
        });
        return;
      }

      expect(auditLogEventTitle).not.toHaveProperty('Action.PostFirstFactorVerification');
      expect(auditLogEventTitle).not.toHaveProperty('Action.PostSignIn');
    }
  );
});
