import { ConnectorType } from '@logto/connector-kit';
import type { Passcode } from '@logto/schemas';
import { PasscodeType } from '@logto/schemas';
import { any } from 'zod';

import { mockConnector, mockMetadata } from '@/__mocks__';
import { getLogtoConnectors } from '@/connectors';
import { defaultConnectorMethods } from '@/connectors/consts';
import RequestError from '@/errors/RequestError';
import {
  consumePasscode,
  deletePasscodesByIds,
  findUnconsumedPasscodeByJtiAndType,
  findUnconsumedPasscodesByJtiAndType,
  increasePasscodeTryCount,
  insertPasscode,
} from '@/queries/passcode';

import {
  createPasscode,
  passcodeExpiration,
  passcodeMaxTryCount,
  passcodeLength,
  sendPasscode,
  verifyPasscode,
} from './passcode';

jest.mock('@/queries/passcode');
jest.mock('@/connectors');

const mockedFindUnconsumedPasscodesByJtiAndType =
  findUnconsumedPasscodesByJtiAndType as jest.MockedFunction<
    typeof findUnconsumedPasscodesByJtiAndType
  >;
const mockedFindUnconsumedPasscodeByJtiAndType =
  findUnconsumedPasscodeByJtiAndType as jest.MockedFunction<
    typeof findUnconsumedPasscodeByJtiAndType
  >;
const mockedDeletePasscodesByIds = deletePasscodesByIds as jest.MockedFunction<
  typeof deletePasscodesByIds
>;
const mockedInsertPasscode = insertPasscode as jest.MockedFunction<typeof insertPasscode>;
const mockedGetLogtoConnectors = getLogtoConnectors as jest.MockedFunction<
  typeof getLogtoConnectors
>;
const mockedConsumePasscode = consumePasscode as jest.MockedFunction<typeof consumePasscode>;
const mockedIncreasePasscodeTryCount = increasePasscodeTryCount as jest.MockedFunction<
  typeof increasePasscodeTryCount
>;

beforeAll(() => {
  mockedFindUnconsumedPasscodesByJtiAndType.mockResolvedValue([]);
  mockedInsertPasscode.mockImplementation(async (data): Promise<Passcode> => {
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
  it('should generate `passcodeLength` digits code for phone and insert to database', async () => {
    const phone = '13000000000';
    const passcode = await createPasscode('jti', PasscodeType.SignIn, {
      phone,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.phone).toEqual(phone);
  });

  it('should generate `passcodeLength` digits code for email and insert to database', async () => {
    const email = 'jony@example.com';
    const passcode = await createPasscode('jti', PasscodeType.SignIn, {
      email,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.email).toEqual(email);
  });

  it('should disable existing passcode', async () => {
    const email = 'jony@example.com';
    const jti = 'jti';
    mockedFindUnconsumedPasscodesByJtiAndType.mockResolvedValue([
      {
        id: 'id',
        interactionJti: jti,
        code: '1234',
        type: PasscodeType.SignIn,
        createdAt: Date.now(),
        phone: '',
        email,
        consumed: false,
        tryCount: 0,
      },
    ]);
    await createPasscode(jti, PasscodeType.SignIn, {
      email,
    });
    expect(mockedDeletePasscodesByIds).toHaveBeenCalledWith(['id']);
  });
});

describe('sendPasscode', () => {
  it('should throw error when email and phone are both empty', async () => {
    const passcode: Passcode = {
      id: 'id',
      interactionJti: 'jti',
      phone: null,
      email: null,
      type: PasscodeType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await expect(sendPasscode(passcode)).rejects.toThrowError(
      new RequestError('passcode.phone_email_empty')
    );
  });

  it('should throw error when email or sms connector can not be found', async () => {
    mockedGetLogtoConnectors.mockResolvedValueOnce([
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
      id: 'id',
      interactionJti: 'jti',
      phone: 'phone',
      email: null,
      type: PasscodeType.SignIn,
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
    mockedGetLogtoConnectors.mockResolvedValueOnce([
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
      id: 'passcode_id',
      interactionJti: 'jti',
      phone: 'phone',
      email: null,
      type: PasscodeType.SignIn,
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
  const passcode: Passcode = {
    id: 'id',
    interactionJti: 'jti',
    phone: 'phone',
    email: null,
    type: PasscodeType.SignIn,
    code: '1234',
    consumed: false,
    tryCount: 0,
    createdAt: Date.now(),
  };

  it('should mark as consumed on successful verification', async () => {
    mockedFindUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' });
    expect(mockedConsumePasscode).toHaveBeenCalledWith(passcode.id);
  });

  it('should fail when passcode not found', async () => {
    mockedFindUnconsumedPasscodeByJtiAndType.mockResolvedValue(null);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.not_found'));
  });

  it('should fail when phone mismatch', async () => {
    mockedFindUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, {
        phone: 'invalid_phone',
      })
    ).rejects.toThrow(new RequestError('passcode.phone_mismatch'));
  });

  it('should fail when email mismatch', async () => {
    mockedFindUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      phone: null,
      email: 'email',
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, {
        email: 'invalid_email',
      })
    ).rejects.toThrow(new RequestError('passcode.email_mismatch'));
  });

  it('should fail when expired', async () => {
    mockedFindUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      createdAt: Date.now() - passcodeExpiration - 100,
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.expired'));
  });

  it('should fail when exceed max count', async () => {
    mockedFindUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      tryCount: passcodeMaxTryCount,
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.exceed_max_try'));
  });

  it('should fail when invalid code, and should increase try_count', async () => {
    mockedFindUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, 'invalid', { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.code_mismatch'));
    expect(mockedIncreasePasscodeTryCount).toHaveBeenCalledWith(passcode.id);
  });
});
