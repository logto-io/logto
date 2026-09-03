import { VerificationType } from '@logto/schemas';

import { buildAuthenticationContext } from './authentication-context.js';

describe('buildAuthenticationContext', () => {
  it('yields an empty context when nothing identified the user', () => {
    expect(buildAuthenticationContext([])).toEqual({});
  });

  it.each([
    [VerificationType.Password, 'pwd'],
    [VerificationType.EmailVerificationCode, 'otp'],
    [VerificationType.PhoneVerificationCode, 'sms'],
    [VerificationType.OneTimeToken, 'otp'],
  ])('reaches 1fa for a %s sign-in', (type, reference) => {
    expect(buildAuthenticationContext([{ type, verifiedAt: 1000 }])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: [reference],
      ts: 1000,
    });
  });

  it('reaches mfa for a passkey sign-in', () => {
    expect(
      buildAuthenticationContext([{ type: VerificationType.SignInPasskey, verifiedAt: 1000 }])
    ).toEqual({ acr: 'urn:logto:acr:mfa', amr: ['pop', 'user', 'mfa'], ts: 1000 });
  });

  it.each([VerificationType.Social, VerificationType.EnterpriseSso])(
    'yields fed and no acr for a %s sign-in',
    (type) => {
      expect(buildAuthenticationContext([{ type, verifiedAt: 1000 }])).toEqual({
        amr: ['fed'],
        ts: 1000,
      });
    }
  );

  it('unions the references of every identifying verification and keeps the earliest time', () => {
    expect(
      buildAuthenticationContext([
        { type: VerificationType.Password, verifiedAt: 2000 },
        { type: VerificationType.Social, verifiedAt: 1000 },
      ])
    ).toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd', 'fed'], ts: 1000 });
  });
});
