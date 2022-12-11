import { PasscodeType, Event } from '@logto/schemas';
import { mockEsmWithActual } from '@logto/shared/esm';

import type { SendPasscodePayload } from '../types/index.js';

const { jest } = import.meta;
const passcode = {
  createPasscode: jest.fn(() => ({})),
  sendPasscode: jest.fn().mockResolvedValue({ dbEntry: { id: 'foo' } }),
};

await mockEsmWithActual('#src/lib/passcode.js', () => passcode);

const { sendPasscodeToIdentifier } = await import('./passcode-validation.js');

const sendPasscodeTestCase = [
  {
    payload: { email: 'email', event: Event.SignIn },
    createPasscodeParams: [PasscodeType.SignIn, { email: 'email' }],
  },
  {
    payload: { email: 'email', event: Event.Register },
    createPasscodeParams: [PasscodeType.Register, { email: 'email' }],
  },
  {
    payload: { email: 'email', event: Event.ForgotPassword },
    createPasscodeParams: [PasscodeType.ForgotPassword, { email: 'email' }],
  },
  {
    payload: { phone: 'phone', event: Event.SignIn },
    createPasscodeParams: [PasscodeType.SignIn, { phone: 'phone' }],
  },
  {
    payload: { phone: 'phone', event: Event.Register },
    createPasscodeParams: [PasscodeType.Register, { phone: 'phone' }],
  },
  {
    payload: { phone: 'phone', event: Event.ForgotPassword },
    createPasscodeParams: [PasscodeType.ForgotPassword, { phone: 'phone' }],
  },
];

describe('passcode-validation utils', () => {
  const log = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(sendPasscodeTestCase)(
    'send passcode successfully',
    async ({ payload, createPasscodeParams }) => {
      await sendPasscodeToIdentifier(payload as SendPasscodePayload, 'jti', log);
      expect(passcode.createPasscode).toBeCalledWith('jti', ...createPasscodeParams);
      expect(passcode.sendPasscode).toBeCalled();
    }
  );
});
