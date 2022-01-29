import { Passcode, PasscodeType } from '@logto/schemas';

import { getConnectorInstanceByType } from '@/connectors';
import { ConnectorType } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import {
  deletePasscodesByIds,
  findUnconsumedPasscodeBySessionIdAndType,
  findUnconsumedPasscodesBySessionIdAndType,
  insertPasscode,
  updatePasscode,
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

const mockedFindUnconsumedPasscodesBySessionIdAndType =
  findUnconsumedPasscodesBySessionIdAndType as jest.MockedFunction<
    typeof findUnconsumedPasscodesBySessionIdAndType
  >;
const mockedFindUnconsumedPasscodeBySessionIdAndType =
  findUnconsumedPasscodeBySessionIdAndType as jest.MockedFunction<
    typeof findUnconsumedPasscodeBySessionIdAndType
  >;
const mockedDeletePasscodesByIds = deletePasscodesByIds as jest.MockedFunction<
  typeof deletePasscodesByIds
>;
const mockedInsertPasscode = insertPasscode as jest.MockedFunction<typeof insertPasscode>;
const mockedGetConnectorInstanceByType = getConnectorInstanceByType as jest.MockedFunction<
  typeof getConnectorInstanceByType
>;
const mockedUpdatePasscode = updatePasscode as jest.MockedFunction<typeof updatePasscode>;

beforeAll(() => {
  mockedFindUnconsumedPasscodesBySessionIdAndType.mockResolvedValue([]);
  mockedInsertPasscode.mockImplementation(async (data) => ({
    ...data,
    createdAt: Date.now(),
    phone: data.phone ?? null,
    email: data.email ?? null,
    consumed: data.consumed ?? false,
    tryCount: data.tryCount ?? 0,
  }));
});

afterEach(() => {
  mockedFindUnconsumedPasscodesBySessionIdAndType.mockClear();
  mockedDeletePasscodesByIds.mockClear();
  mockedInsertPasscode.mockClear();
  mockedGetConnectorInstanceByType.mockClear();
});

describe('createPasscode', () => {
  it('should generate `passcodeLength` digits code for phone and insert to database', async () => {
    const phone = '13000000000';
    const passcode = await createPasscode('sessionId', PasscodeType.SignIn, {
      phone,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.phone).toEqual(phone);
  });

  it('should generate `passcodeLength` digits code for email and insert to database', async () => {
    const email = 'jony@example.com';
    const passcode = await createPasscode('sessionId', PasscodeType.SignIn, {
      email,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.email).toEqual(email);
  });

  it('should disable existing passcode', async () => {
    const email = 'jony@example.com';
    const sessionId = 'sessonId';
    mockedFindUnconsumedPasscodesBySessionIdAndType.mockResolvedValue([
      {
        id: 'id',
        sessionId,
        code: '1234',
        type: PasscodeType.SignIn,
        createdAt: Date.now(),
        phone: '',
        email,
        consumed: false,
        tryCount: 0,
      },
    ]);
    await createPasscode(sessionId, PasscodeType.SignIn, {
      email,
    });
    expect(mockedDeletePasscodesByIds).toHaveBeenCalledWith(['id']);
  });
});

describe('sendPasscode', () => {
  it('should throw error when email and phone are both empty', async () => {
    const passcode: Passcode = {
      id: 'id',
      sessionId: 'sessionId',
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

  it('should call sendPasscode with params matching', async () => {
    const sendMessage = jest.fn();
    mockedGetConnectorInstanceByType.mockResolvedValue({
      metadata: {
        id: 'id',
        type: ConnectorType.SMS,
        name: {},
        logo: '',
        description: {},
      },
      sendMessage,
      validateConfig: jest.fn(),
    });
    const passcode: Passcode = {
      id: 'id',
      sessionId: 'sessionId',
      phone: 'phone',
      email: null,
      type: PasscodeType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await sendPasscode(passcode);
    expect(sendMessage).toHaveBeenCalledWith(passcode.phone, passcode.type, {
      code: passcode.code,
    });
  });
});

describe('verifyPasscode', () => {
  const passcode: Passcode = {
    id: 'id',
    sessionId: 'sessionId',
    phone: 'phone',
    email: null,
    type: PasscodeType.SignIn,
    code: '1234',
    consumed: false,
    tryCount: 0,
    createdAt: Date.now(),
  };

  it('should mark as consumed on successful verification', async () => {
    mockedFindUnconsumedPasscodeBySessionIdAndType.mockResolvedValue(passcode);
    await verifyPasscode(passcode.sessionId, passcode.type, passcode.code, { phone: 'phone' });
    expect(mockedUpdatePasscode).toHaveBeenCalledWith(
      expect.objectContaining({
        set: { consumed: true },
      })
    );
  });

  it('should fail when passcode not found', async () => {
    mockedFindUnconsumedPasscodeBySessionIdAndType.mockResolvedValue(null);
    await expect(
      verifyPasscode(passcode.sessionId, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.not_found'));
  });

  it('should fail when phone mismatch', async () => {
    mockedFindUnconsumedPasscodeBySessionIdAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.sessionId, passcode.type, passcode.code, { phone: 'invalid_phone' })
    ).rejects.toThrow(new RequestError('passcode.phone_mismatch'));
  });

  it('should fail when email mismatch', async () => {
    mockedFindUnconsumedPasscodeBySessionIdAndType.mockResolvedValue({
      ...passcode,
      phone: null,
      email: 'email',
    });
    await expect(
      verifyPasscode(passcode.sessionId, passcode.type, passcode.code, { email: 'invalid_email' })
    ).rejects.toThrow(new RequestError('passcode.email_mismatch'));
  });

  it('should fail when expired', async () => {
    mockedFindUnconsumedPasscodeBySessionIdAndType.mockResolvedValue({
      ...passcode,
      createdAt: Date.now() - passcodeExpiration - 100,
    });
    await expect(
      verifyPasscode(passcode.sessionId, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.expired'));
  });

  it('should fail when exceed max count', async () => {
    mockedFindUnconsumedPasscodeBySessionIdAndType.mockResolvedValue({
      ...passcode,
      tryCount: passcodeMaxTryCount,
    });
    await expect(
      verifyPasscode(passcode.sessionId, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.exceed_max_try'));
  });

  it('should fail when invalid code, and should increase try_count', async () => {
    mockedFindUnconsumedPasscodeBySessionIdAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.sessionId, passcode.type, 'invalid', { phone: 'phone' })
    ).rejects.toThrow(new RequestError('passcode.code_mismatch'));
    expect(mockedUpdatePasscode).toHaveBeenCalledWith(
      expect.objectContaining({
        set: { tryCount: passcode.tryCount + 1 },
      })
    );
  });
});
