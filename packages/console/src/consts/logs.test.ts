const loadLogsConsts = async (isDevFeaturesEnabled: boolean) => {
  jest.resetModules();
  jest.doMock('./env', () => ({
    isDevFeaturesEnabled,
  }));

  return import('./logs');
};

describe('action audit log event titles', () => {
  it('exposes action event titles when dev features are enabled', async () => {
    const { auditLogEventTitle } = await loadLogsConsts(true);

    expect(auditLogEventTitle).toMatchObject({
      'Action.PostFirstFactorVerification': 'Execute post first-factor verification action',
      'Action.PostSignIn': 'Execute post sign-in action',
      'Action.PreRegister': 'Execute pre-register action',
    });
  });

  it('hides the pre-register action event title when dev features are disabled', async () => {
    const { auditLogEventTitle } = await loadLogsConsts(false);

    expect(auditLogEventTitle).toMatchObject({
      'Action.PostFirstFactorVerification': 'Execute post first-factor verification action',
      'Action.PostSignIn': 'Execute post sign-in action',
    });
    expect(auditLogEventTitle).not.toHaveProperty('Action.PreRegister');
  });

  it('exposes trusted-device event titles', async () => {
    const { auditLogEventTitle } = await loadLogsConsts(false);

    expect(auditLogEventTitle).toMatchObject({
      'TrustedDevice.Created': 'Create trusted device',
      'TrustedDevice.Used': 'Use trusted device',
    });
  });
});
