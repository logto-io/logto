import { TemplateType } from '@logto/connector-kit';
import { type Passcode } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createPasscodeLibrary, passcodeExpiration, passcodeMaxTryCount } from './passcode.js';

const { jest } = import.meta;

const passcodeQueries = {
  findUnconsumedPasscodesByJtiAndType: jest.fn(),
  findUnconsumedPasscodeByJtiAndType: jest.fn(),
  findUnconsumedPasscodeByIdentifierAndType: jest.fn(),
  findUnconsumedPasscodesByIdentifierAndType: jest.fn(),
  deletePasscodesByIds: jest.fn(),
  insertPasscode: jest.fn(),
  consumePasscode: jest.fn(),
  increasePasscodeTryCount: jest.fn(),
};
const {
  findUnconsumedPasscodeByJtiAndType,
  findUnconsumedPasscodeByIdentifierAndType,
  increasePasscodeTryCount,
  consumePasscode,
} = passcodeQueries;

const { verifyPasscode } = createPasscodeLibrary(
  new MockQueries({
    passcodes: passcodeQueries,
    signInExperiences: {
      findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
    },
  }),
  // @ts-expect-error Only queries are required in these tests.
  { getMessageConnector: jest.fn() }
);

describe('verifyPasscode', () => {
  const passcode = {
    tenantId: 'fake_tenant',
    id: 'id',
    interactionJti: 'jti',
    phone: 'phone',
    email: null,
    type: TemplateType.SignIn,
    code: '1234',
    consumed: false,
    tryCount: 0,
    createdAt: Date.now(),
  } satisfies Passcode;

  beforeEach(() => {
    increasePasscodeTryCount.mockResolvedValue({ ...passcode, tryCount: 1 });
    consumePasscode.mockResolvedValue({ ...passcode, consumed: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mark as consumed on successful verification', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' });
    expect(increasePasscodeTryCount).toHaveBeenCalledWith(passcode.id, passcodeMaxTryCount);
    expect(consumePasscode).toHaveBeenCalledWith(passcode.id);
  });

  it('should fail when passcode not found', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(null);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.not_found'));
  });

  it('should mark as consumed on successful verification without jti', async () => {
    const passcodeWithoutJti = {
      ...passcode,
      type: TemplateType.Generic,
      interactionJti: null,
    };
    findUnconsumedPasscodeByIdentifierAndType.mockResolvedValue(passcodeWithoutJti);
    await verifyPasscode(undefined, passcodeWithoutJti.type, passcodeWithoutJti.code, {
      phone: 'phone',
    });
    expect(consumePasscode).toHaveBeenCalledWith(passcodeWithoutJti.id);
  });

  it('should fail when phone mismatch', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, {
        phone: 'invalid_phone',
      })
    ).rejects.toThrow(new RequestError('verification_code.phone_mismatch'));
  });

  it('should fail when email mismatch', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      phone: null,
      email: 'email',
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, {
        email: 'invalid_email',
      })
    ).rejects.toThrow(new RequestError('verification_code.email_mismatch'));
  });

  it('should fail when expired', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      createdAt: Date.now() - passcodeExpiration - 100,
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.expired'));
  });

  it('should fail when exceed max count', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      tryCount: passcodeMaxTryCount,
    });
    increasePasscodeTryCount.mockResolvedValueOnce(null);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.exceed_max_try'));
    expect(consumePasscode).not.toHaveBeenCalled();
  });

  it('should fail when consumed before the attempt is recorded', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValueOnce(passcode).mockResolvedValueOnce(null);
    increasePasscodeTryCount.mockResolvedValueOnce(null);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.not_found'));
    expect(consumePasscode).not.toHaveBeenCalled();
  });

  it('should fail when replaced before the attempt is recorded', async () => {
    findUnconsumedPasscodeByJtiAndType
      .mockResolvedValueOnce(passcode)
      .mockResolvedValueOnce({ ...passcode, id: 'new_id' });
    increasePasscodeTryCount.mockResolvedValueOnce(null);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.not_found'));
  });

  it('should fail when invalid code, and should increase try_count', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, 'invalid', { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.code_mismatch'));
    expect(increasePasscodeTryCount).toHaveBeenCalledWith(passcode.id, passcodeMaxTryCount);
    expect(consumePasscode).not.toHaveBeenCalled();
  });

  it('should fail when consumed by another request', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    consumePasscode.mockResolvedValueOnce(null);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.not_found'));
  });
});
