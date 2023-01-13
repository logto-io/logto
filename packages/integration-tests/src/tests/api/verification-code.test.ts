import { VerificationCodeType } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';

import { requestVerificationCode, verifyVerificationCode } from '#src/api/verification-code.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { readVerificationCode, removeVerificationCode } from '#src/helpers/index.js';
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
    await removeVerificationCode();
  });

  it('should create an email verification code on server side', async () => {
    await requestVerificationCode({ email: mockEmail });

    const { code, type, address } = await readVerificationCode();

    expect(type).toBe(VerificationCodeType.Generic);
    expect(address).toBe(mockEmail);
    expect(code).not.toBeNull();
  });

  it('should create an SMS verification code on server side', async () => {
    await requestVerificationCode({ phone: mockPhone });

    const { code, type, phone } = await readVerificationCode();

    expect(type).toBe(VerificationCodeType.Generic);
    expect(phone).toBe(mockPhone);
    expect(code).not.toBeNull();
  });

  it('should be able to verify the email verification code', async () => {
    await requestVerificationCode({ email: mockEmail });

    const { code } = await readVerificationCode();

    await expect(
      verifyVerificationCode({ email: mockEmail, verificationCode: code })
    ).resolves.not.toThrow();
  });

  it('should be able to verify the sms verification code', async () => {
    await requestVerificationCode({ phone: mockPhone });

    const { code } = await readVerificationCode();

    await expect(
      verifyVerificationCode({ phone: mockPhone, verificationCode: code })
    ).resolves.not.toThrow();
  });

  it('should throw when the code is not valid', async () => {
    await requestVerificationCode({ phone: mockPhone });
    await readVerificationCode();
    await expect(
      verifyVerificationCode({ phone: mockPhone, verificationCode: '666' })
    ).rejects.toThrow();
  });
});
