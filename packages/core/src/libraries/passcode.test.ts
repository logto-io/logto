import { ConnectorType, VerificationCodeType } from '@logto/connector-kit';
import { Passcode } from '@logto/schemas';
import { any } from 'zod';

import { mockConnector, mockMetadata } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';
import { defaultConnectorMethods } from '#src/utils/connectors/consts.js';

import {
  createPasscodeLibrary,
  passcodeExpiration,
  passcodeMaxTryCount,
  passcodeLength,
} from './passcode.js';

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
  findUnconsumedPasscodesByJtiAndType,
  findUnconsumedPasscodeByIdentifierAndType,
  findUnconsumedPasscodesByIdentifierAndType,
  deletePasscodesByIds,
  increasePasscodeTryCount,
  insertPasscode,
  consumePasscode,
} = passcodeQueries;

const getLogtoConnectors = jest.fn();

const { createPasscode, sendPasscode, verifyPasscode } = createPasscodeLibrary(
  new MockQueries({ passcodes: passcodeQueries }),
  // @ts-expect-error
  { getLogtoConnectors }
);

beforeAll(() => {
  findUnconsumedPasscodesByJtiAndType.mockResolvedValue([]);
  findUnconsumedPasscodesByIdentifierAndType.mockResolvedValue([]);
  insertPasscode.mockImplementation(async (data): Promise<Passcode> => {
    return {
      phone: null,
      email: null,
      consumed: false,
      tryCount: 0,
      ...data,
      createdAt: Date.now(),
    };
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('createPasscode', () => {
  it('should generate `passcodeLength` digits code for phone with valid session and insert to database', async () => {
    const phone = '13000000000';
    const passcode = await createPasscode('jti', VerificationCodeType.SignIn, {
      phone,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.phone).toEqual(phone);
  });

  it('should generate `passcodeLength` digits code for email with valid session and insert to database', async () => {
    const email = 'jony@example.com';
    const passcode = await createPasscode('jti', VerificationCodeType.SignIn, {
      email,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.email).toEqual(email);
  });

  it('should generate `passcodeLength` digits code for phone and insert to database, without session', async () => {
    const phone = '13000000000';
    const passcode = await createPasscode(undefined, VerificationCodeType.Generic, {
      phone,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.phone).toEqual(phone);
  });

  it('should generate `passcodeLength` digits code for email and insert to database, without session', async () => {
    const email = 'jony@example.com';
    const passcode = await createPasscode(undefined, VerificationCodeType.Generic, {
      email,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.email).toEqual(email);
  });

  it('should remove unconsumed passcode from the same device before sending a new one', async () => {
    const email = 'jony@example.com';
    const jti = 'jti';
    findUnconsumedPasscodesByJtiAndType.mockResolvedValue([
      {
        id: 'id',
        interactionJti: jti,
        code: '1234',
        type: VerificationCodeType.SignIn,
        createdAt: Date.now(),
        phone: '',
        email,
        consumed: false,
        tryCount: 0,
      },
    ]);
    await createPasscode(jti, VerificationCodeType.SignIn, {
      email,
    });
    expect(deletePasscodesByIds).toHaveBeenCalledWith(['id']);
  });

  it('should remove unconsumed passcode from the same device before sending a new one, without session', async () => {
    const phone = '1234567890';
    findUnconsumedPasscodesByIdentifierAndType.mockResolvedValue([
      {
        id: 'id',
        interactionJti: null,
        code: '123456',
        type: VerificationCodeType.Generic,
        createdAt: Date.now(),
        phone,
        email: null,
        consumed: false,
        tryCount: 0,
      },
    ]);
    await createPasscode(undefined, VerificationCodeType.Generic, {
      phone,
    });
    expect(deletePasscodesByIds).toHaveBeenCalledWith(['id']);
  });
});

describe('sendPasscode', () => {
  it('should throw error when email and phone are both empty', async () => {
    const passcode: Passcode = {
      tenantId: 'fake_tenant',
      id: 'id',
      interactionJti: 'jti',
      phone: null,
      email: null,
      type: VerificationCodeType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await expect(sendPasscode(passcode)).rejects.toThrowError(
      new RequestError('verification_code.phone_email_empty')
    );
  });

  it('should throw error when email or sms connector can not be found', async () => {
    getLogtoConnectors.mockResolvedValueOnce([
      {
        ...defaultConnectorMethods,
        dbEntry: {
          ...mockConnector,
          id: 'id1',
        },
        metadata: {
          ...mockMetadata,
          platform: null,
        },
        type: ConnectorType.Email,
        sendMessage: jest.fn(),
        configGuard: any(),
      },
    ]);
    const passcode: Passcode = {
      tenantId: 'fake_tenant',
      id: 'id',
      interactionJti: 'jti',
      phone: 'phone',
      email: null,
      type: VerificationCodeType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await expect(sendPasscode(passcode)).rejects.toThrowError(
      new RequestError({
        code: 'connector.not_found',
        type: ConnectorType.Sms,
      })
    );
  });

  it('should call sendPasscode with params matching', async () => {
    const sendMessage = jest.fn();
    getLogtoConnectors.mockResolvedValueOnce([
      {
        ...defaultConnectorMethods,
        configGuard: any(),
        dbEntry: {
          ...mockConnector,
          id: 'id0',
        },
        metadata: {
          ...mockMetadata,
          platform: null,
        },
        type: ConnectorType.Sms,
        sendMessage,
      },
      {
        ...defaultConnectorMethods,
        configGuard: any(),
        dbEntry: {
          ...mockConnector,
          id: 'id1',
        },
        metadata: {
          ...mockMetadata,
          platform: null,
        },
        type: ConnectorType.Email,
        sendMessage,
      },
    ]);
    const passcode: Passcode = {
      tenantId: 'fake_tenant',
      id: 'passcode_id',
      interactionJti: 'jti',
      phone: 'phone',
      email: null,
      type: VerificationCodeType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await sendPasscode(passcode);
    expect(sendMessage).toHaveBeenCalledWith({
      to: passcode.phone,
      type: passcode.type,
      payload: {
        code: passcode.code,
      },
    });
  });
});

describe('verifyPasscode', () => {
  const passcode = {
    tenantId: 'fake_tenant',
    id: 'id',
    interactionJti: 'jti',
    phone: 'phone',
    email: null,
    type: VerificationCodeType.SignIn,
    code: '1234',
    consumed: false,
    tryCount: 0,
    createdAt: Date.now(),
  } satisfies Passcode;

  it('should mark as consumed on successful verification', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' });
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
      type: VerificationCodeType.Generic,
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
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.exceed_max_try'));
  });

  it('should fail when invalid code, and should increase try_count', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, 'invalid', { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.code_mismatch'));
    expect(increasePasscodeTryCount).toHaveBeenCalledWith(passcode.id);
  });
});
