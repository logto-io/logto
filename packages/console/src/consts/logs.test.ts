import { auditLogEventTitle } from './logs';

describe('action audit log event titles', () => {
  it('exposes action event titles', () => {
    expect(auditLogEventTitle).toMatchObject({
      'Action.PostFirstFactorVerification': 'Execute post first-factor verification action',
      'Action.PostSignIn': 'Execute post sign-in action',
    });
  });

  it('exposes trusted-device event titles', () => {
    expect(auditLogEventTitle).toMatchObject({
      'TrustedDevice.Created': 'Create trusted device',
      'TrustedDevice.Used': 'Use trusted device',
    });
  });
});
