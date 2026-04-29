import { TemplateType } from '@logto/connector-kit';
import { SignInIdentifier, VerificationType } from '@logto/schemas';

import { type PasscodeLibrary } from '#src/libraries/passcode.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { EmailCodeVerification } from './code-verification.js';

const { jest } = import.meta;

describe('EmailCodeVerification', () => {
  it('should create passcode without sending when delivery is skipped', async () => {
    const createPasscode = jest.fn().mockResolvedValue({
      tenantId: 'fake_tenant',
      id: 'passcode_id',
      interactionJti: 'verification_id',
      phone: null,
      email: 'foo@example.com',
      type: TemplateType.ForgotPassword,
      code: '123456',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    });
    const sendPasscode = jest.fn();
    const libraries = {
      passcodes: {
        createPasscode,
        sendPasscode,
      } as unknown as PasscodeLibrary,
    } as unknown as Libraries;

    const verification = new EmailCodeVerification(libraries, {} as unknown as Queries, {
      id: 'verification_id',
      type: VerificationType.EmailVerificationCode,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@example.com',
      },
      templateType: TemplateType.ForgotPassword,
      verified: false,
    });

    await verification.sendVerificationCode({ locale: 'en' }, { skipDelivery: true });

    expect(createPasscode).toHaveBeenCalledWith('verification_id', TemplateType.ForgotPassword, {
      email: 'foo@example.com',
    });
    expect(sendPasscode).not.toHaveBeenCalled();
  });
});
