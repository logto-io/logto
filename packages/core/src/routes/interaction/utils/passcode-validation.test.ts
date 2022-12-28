import { VerificationCodeType } from '@logto/connector-kit';
import { InteractionEvent } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const passcode = {
  createPasscode: jest.fn(() => ({})),
  sendPasscode: jest.fn().mockResolvedValue({ dbEntry: { id: 'foo' } }),
};

await mockEsmWithActual('#src/libraries/passcode.js', () => passcode);

const { sendPasscodeToIdentifier } = await import('./passcode-validation.js');

const sendPasscodeTestCase = [
  {
    payload: { email: 'email', event: InteractionEvent.SignIn },
    createPasscodeParams: [VerificationCodeType.SignIn, { email: 'email' }],
  },
  {
    payload: { email: 'email', event: InteractionEvent.Register },
    createPasscodeParams: [VerificationCodeType.Register, { email: 'email' }],
  },
  {
    payload: { email: 'email', event: InteractionEvent.ForgotPassword },
    createPasscodeParams: [VerificationCodeType.ForgotPassword, { email: 'email' }],
  },
  {
    payload: { phone: 'phone', event: InteractionEvent.SignIn },
    createPasscodeParams: [VerificationCodeType.SignIn, { phone: 'phone' }],
  },
  {
    payload: { phone: 'phone', event: InteractionEvent.Register },
    createPasscodeParams: [VerificationCodeType.Register, { phone: 'phone' }],
  },
  {
    payload: { phone: 'phone', event: InteractionEvent.ForgotPassword },
    createPasscodeParams: [VerificationCodeType.ForgotPassword, { phone: 'phone' }],
  },
];

describe('passcode-validation utils', () => {
  const log = createMockLogContext();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(sendPasscodeTestCase)(
    'send passcode successfully',
    async ({ payload, createPasscodeParams }) => {
      await sendPasscodeToIdentifier(payload, 'jti', log.createLog);
      expect(passcode.createPasscode).toBeCalledWith('jti', ...createPasscodeParams);
      expect(passcode.sendPasscode).toBeCalled();
    }
  );
});
