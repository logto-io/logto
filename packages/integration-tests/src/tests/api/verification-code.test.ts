import { TemplateType } from '@logto/connector-kit';
import { ConnectorType, type RequestVerificationCodePayload } from '@logto/schemas';

import { requestVerificationCode, verifyVerificationCode } from '#src/api/verification-code.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects, readConnectorMessage, removeConnectorMessage } from '#src/helpers/index.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';

describe('Generic verification code through management API', () => {
  const mockEmail = 'foo@bar.com';
  const mockPhone = '1234567890';

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  afterEach(async () => {
    await Promise.all([removeConnectorMessage('Sms'), removeConnectorMessage('Email')]);
  });

  it('should create an email verification code on server side', async () => {
    const payload: RequestVerificationCodePayload = { email: mockEmail };
    const response = await requestVerificationCode(payload);
    expect(response.status).toBe(204);

    const { code, type, address } = await readConnectorMessage('Email');

    expect(type).toBe(TemplateType.Generic);
    expect(address).toBe(mockEmail);
    expect(code).not.toBeNull();
  });

  it('should create an SMS verification code on server side', async () => {
    const payload: RequestVerificationCodePayload = { phone: mockPhone };
    const response = await requestVerificationCode(payload);
    expect(response.status).toBe(204);

    const { code, type, phone } = await readConnectorMessage('Sms');

    expect(type).toBe(TemplateType.Generic);
    expect(phone).toBe(mockPhone);
    expect(code).not.toBeNull();
  });

  it('should fail to create a verification code on server side when the email and phone are not provided', async () => {
    await expectRejects(requestVerificationCode({ username: 'any_string' }), {
      code: 'guard.invalid_input',
      status: 400,
    });

    await expect(readConnectorMessage('Email')).rejects.toThrow();
    await expect(readConnectorMessage('Sms')).rejects.toThrow();
  });

  it('should fail to send a verification code on server side when no email connector has been set', async () => {
    const emailForTestSendCode = 'test_send@email.com';
    await clearConnectorsByTypes([ConnectorType.Email]);
    await expectRejects(requestVerificationCode({ email: emailForTestSendCode }), {
      code: 'connector.not_found',
      status: 501,
    });

    await expectRejects(
      verifyVerificationCode({ email: emailForTestSendCode, verificationCode: 'any_string' }),
      {
        messageIncludes: 'Invalid verification code.',
        code: 'verification_code.code_mismatch',
        status: 400,
      }
    );

    // Restore the email connector
    await setEmailConnector();
  });

  it('should fail to send a verification code on server side when no SMS connector has not been set', async () => {
    const phoneForTestSendCode = '1233212321';
    await clearConnectorsByTypes([ConnectorType.Sms]);
    await expectRejects(requestVerificationCode({ phone: phoneForTestSendCode }), {
      code: 'connector.not_found',
      status: 501,
    });

    await expectRejects(
      verifyVerificationCode({ phone: phoneForTestSendCode, verificationCode: 'any_string' }),
      {
        messageIncludes: 'Invalid verification code.',
        code: 'verification_code.code_mismatch',
        status: 400,
      }
    );

    // Restore the SMS connector
    await setSmsConnector();
  });

  it('should be able to verify the email verification code', async () => {
    await requestVerificationCode({ email: mockEmail });

    const { code } = await readConnectorMessage('Email');

    await expect(
      verifyVerificationCode({ email: mockEmail, verificationCode: code })
    ).resolves.not.toThrow();
  });

  it('should be able to verify the sms verification code', async () => {
    await requestVerificationCode({ phone: mockPhone });

    const { code } = await readConnectorMessage('Sms');

    await expect(
      verifyVerificationCode({ phone: mockPhone, verificationCode: code })
    ).resolves.not.toThrow();
  });

  it('should throw when the code is not valid', async () => {
    await requestVerificationCode({ phone: mockPhone });
    await readConnectorMessage('Sms');
    await expectRejects(verifyVerificationCode({ phone: mockPhone, verificationCode: '666' }), {
      code: 'verification_code.code_mismatch',
      status: 400,
    });
  });

  it('should throw when the phone number is not matched', async () => {
    const phoneToVerify = '666';
    const phoneToGetCode = mockPhone;
    await requestVerificationCode({ phone: phoneToGetCode });
    const { code, phone } = await readConnectorMessage('Sms');
    expect(phoneToGetCode).toEqual(phone);
    await expectRejects(verifyVerificationCode({ phone: phoneToVerify, verificationCode: code }), {
      code: 'verification_code.not_found',
      status: 400,
    });
  });

  it('should throw when the email is not matched', async () => {
    const emailToVerify = 'verify_email@mail.com';
    const emailToGetCode = mockEmail;
    await requestVerificationCode({ email: emailToGetCode });
    const { code, address } = await readConnectorMessage('Email');
    expect(emailToGetCode).toEqual(address);
    await expectRejects(verifyVerificationCode({ email: emailToVerify, verificationCode: code }), {
      code: 'verification_code.not_found',
      status: 400,
    });
  });
});
