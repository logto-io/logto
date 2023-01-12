import { VerificationCodeType } from '@logto/connector-kit';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const passcodeLibraries = await mockEsmWithActual('#src/libraries/passcode.js', () => ({
  createPasscode: jest.fn(),
  sendPasscode: jest.fn(),
  verifyPasscode: jest.fn(),
}));

const { createPasscode, sendPasscode, verifyPasscode } = passcodeLibraries;

const passcodeQueries = await mockEsmWithActual('#src/queries/passcode.js', () => ({
  findUnconsumedPasscodeByIdentifierAndType: jest.fn(async () => null),
  findUnconsumedPasscodesByIdentifierAndType: jest.fn(),
}));

const verificationCodeRoutes = await pickDefault(import('./verification-code.js'));

describe('Generic verification code flow triggered by management API', () => {
  const tenantContext = new MockTenant(
    undefined,
    { passcodes: passcodeQueries },
    {
      passcodes: passcodeLibraries,
    }
  );
  const verificationCodeRequest = createRequester({
    authedRoutes: verificationCodeRoutes,
    tenantContext,
  });
  const type = VerificationCodeType.Generic;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /verification-codes with email should not throw', async () => {
    const email = 'test@abc.com';
    const response = await verificationCodeRequest.post('/verification-codes').send({ email });
    expect(response.status).toEqual(204);
    expect(createPasscode).toBeCalledWith(undefined, type, { email });
    expect(sendPasscode).toBeCalled();
  });

  test('POST /verification-codes with phone number should not throw', async () => {
    const phone = '1234567890';
    const response = await verificationCodeRequest.post('/verification-codes').send({ phone });
    expect(response.status).toEqual(204);
    expect(createPasscode).toBeCalledWith(undefined, type, { phone });
    expect(sendPasscode).toBeCalled();
  });

  test('POST /verification-codes with invalid payload should throw', async () => {
    await expect(
      verificationCodeRequest.post('/verification-codes').send({
        foo: 'bar',
      })
    ).resolves.toHaveProperty('status', 400);
  });

  test('POST /verification-codes/verify with email and code should not throw', async () => {
    const email = 'test@abc.com';
    const verificationCode = '000000';
    const response = await verificationCodeRequest
      .post('/verification-codes/verify')
      .send({ email, verificationCode });
    expect(response.status).toEqual(204);
    expect(verifyPasscode).toBeCalledWith(undefined, type, verificationCode, { email });
  });

  test('POST /verification-codes/verify with phone number and code should not throw', async () => {
    const phone = '1234567890';
    const verificationCode = '123456';
    const response = await verificationCodeRequest
      .post('/verification-codes/verify')
      .send({ phone, verificationCode });
    expect(response.status).toEqual(204);
    expect(verifyPasscode).toBeCalledWith(undefined, type, verificationCode, { phone });
  });

  test('POST /verification-codes/verify with invalid payload should throw', async () => {
    await expect(
      verificationCodeRequest.post('/verification-codes/verify').send({
        foo: 'bar',
      })
    ).resolves.toHaveProperty('status', 400);
  });
});
