import { PasscodeType } from '@logto/schemas';

import {
  deletePasscodesByIds,
  findUnconsumedPasscodesBySessionIdAndType,
  insertPasscode,
} from '@/queries/passcode';

import { createPasscode, passcodeLength } from './passcode';

jest.mock('@/queries/passcode');

const mockedFindUnconsumedPasscodesBySessionIdAndType =
  findUnconsumedPasscodesBySessionIdAndType as jest.MockedFunction<
    typeof findUnconsumedPasscodesBySessionIdAndType
  >;
const mockedDeletePasscodesByIds = deletePasscodesByIds as jest.MockedFunction<
  typeof deletePasscodesByIds
>;
const mockedInsertPasscode = insertPasscode as jest.MockedFunction<typeof insertPasscode>;

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
