import { PasscodeType } from '@logto/schemas';

import {
  findUnusedPasscodeBySessionIdAndType,
  insertPasscode,
  updatePasscode,
} from '@/queries/passcode';

import { createPasscode } from './passcode';

jest.mock('@/queries/passcode');

const mockedFindUnusedPasscodeBySessionIdAndType =
  findUnusedPasscodeBySessionIdAndType as jest.MockedFunction<
    typeof findUnusedPasscodeBySessionIdAndType
  >;
const mockedUpdatePasscode = updatePasscode as jest.MockedFunction<typeof updatePasscode>;
const mockedInsertPasscode = insertPasscode as jest.MockedFunction<typeof insertPasscode>;

beforeAll(() => {
  mockedInsertPasscode.mockImplementation(async (data) => ({
    ...data,
    createdAt: Date.now(),
    phone: data.phone ?? '',
    email: data.email ?? '',
    used: data.used ?? false,
    tryCount: data.tryCount ?? 0,
  }));
});

afterEach(() => {
  mockedFindUnusedPasscodeBySessionIdAndType.mockClear();
  mockedUpdatePasscode.mockClear();
  mockedInsertPasscode.mockClear();
});

describe('createPasscode', () => {
  it('should generate 6 digits code for phone and insert to database', async () => {
    const phone = '13000000000';
    const passcode = await createPasscode('sessionId', PasscodeType.SignIn, {
      phone,
    });
    expect(/^\d{6}$/.test(passcode.code)).toBeTruthy();
    expect(passcode.phone).toEqual(phone);
  });

  it('should generate 6 digits code for email and insert to database', async () => {
    const email = 'jony@example.com';
    const passcode = await createPasscode('sessionId', PasscodeType.SignIn, {
      email,
    });
    expect(/^\d{6}$/.test(passcode.code)).toBeTruthy();
    expect(passcode.email).toEqual(email);
  });

  it('should disable existing passcode', async () => {
    const email = 'jony@example.com';
    const sessionId = 'sessonId';
    mockedFindUnusedPasscodeBySessionIdAndType.mockResolvedValue({
      id: 'id',
      sessionId,
      code: '1234',
      type: PasscodeType.SignIn,
      createdAt: Date.now(),
      phone: '',
      email,
      used: false,
      tryCount: 0,
    });
    await createPasscode(sessionId, PasscodeType.SignIn, {
      email,
    });
    expect(mockedUpdatePasscode).toHaveBeenCalledWith(
      expect.objectContaining({
        set: { used: true },
      })
    );
  });
});
