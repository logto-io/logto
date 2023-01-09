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

const { sendVerificationCodeToIdentifier } = await import('./verification-code-validation.js');

const sendVerificationCodeTestCase = [
  {
    payload: { email: 'email', event: InteractionEvent.SignIn },
    createVerificationCodeParams: [VerificationCodeType.SignIn, { email: 'email' }],
  },
  {
    payload: { email: 'email', event: InteractionEvent.Register },
    createVerificationCodeParams: [VerificationCodeType.Register, { email: 'email' }],
  },
  {
    payload: { email: 'email', event: InteractionEvent.ForgotPassword },
    createVerificationCodeParams: [VerificationCodeType.ForgotPassword, { email: 'email' }],
  },
  {
    payload: { phone: 'phone', event: InteractionEvent.SignIn },
    createVerificationCodeParams: [VerificationCodeType.SignIn, { phone: 'phone' }],
  },
  {
    payload: { phone: 'phone', event: InteractionEvent.Register },
    createVerificationCodeParams: [VerificationCodeType.Register, { phone: 'phone' }],
  },
  {
    payload: { phone: 'phone', event: InteractionEvent.ForgotPassword },
    createVerificationCodeParams: [VerificationCodeType.ForgotPassword, { phone: 'phone' }],
  },
];

describe('verification-code-validation utils', () => {
  const log = createMockLogContext();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(sendVerificationCodeTestCase)(
    'send verification code successfully',
    async ({ payload, createVerificationCodeParams }) => {
      await sendVerificationCodeToIdentifier(payload, 'jti', log.createLog);
      expect(passcode.createPasscode).toBeCalledWith('jti', ...createVerificationCodeParams);
      expect(passcode.sendPasscode).toBeCalled();
    }
  );
});
