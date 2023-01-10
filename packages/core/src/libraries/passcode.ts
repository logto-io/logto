import type { EmailConnector, VerificationCodeType, SmsConnector } from '@logto/connector-kit';
import {
  verificationCodeTypeGuard,
  ConnectorError,
  ConnectorErrorCodes,
} from '@logto/connector-kit';
import type { Passcode } from '@logto/schemas';
import { customAlphabet, nanoid } from 'nanoid';

import RequestError from '#src/errors/RequestError/index.js';
import { getLogtoConnectors } from '#src/libraries/connector.js';
import {
  consumePasscode,
  deletePasscodesByIds,
  findUnconsumedPasscodeByJtiAndType,
  findUnconsumedPasscodesByJtiAndType,
  increasePasscodeTryCount,
  insertPasscode,
} from '#src/queries/passcode.js';
import assertThat from '#src/utils/assert-that.js';
import { ConnectorType } from '#src/utils/connectors/types.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

export const passcodeLength = 6;
const randomCode = customAlphabet('1234567890', passcodeLength);

export const createPasscode = async (
  jti: string,
  type: VerificationCodeType,
  payload: { phone: string } | { email: string }
) => {
  // Disable existing passcodes.
  const passcodes = await findUnconsumedPasscodesByJtiAndType(jti, type);

  if (passcodes.length > 0) {
    await deletePasscodesByIds(passcodes.map(({ id }) => id));
  }

  return insertPasscode({
    id: nanoid(),
    interactionJti: jti,
    type,
    code: randomCode(),
    ...payload,
  });
};

export const sendPasscode = async (passcode: Passcode) => {
  const emailOrPhone = passcode.email ?? passcode.phone;

  if (!emailOrPhone) {
    throw new RequestError('verification_code.phone_email_empty');
  }

  const expectType = passcode.phone ? ConnectorType.Sms : ConnectorType.Email;
  const connectors = await getLogtoConnectors();

  const connector = connectors.find(
    (connector): connector is LogtoConnector<SmsConnector | EmailConnector> =>
      connector.type === expectType
  );

  assertThat(
    connector,
    new RequestError({
      code: 'connector.not_found',
      type: expectType,
    })
  );

  const { dbEntry, metadata, sendMessage } = connector;

  const messageTypeResult = verificationCodeTypeGuard.safeParse(passcode.type);

  if (!messageTypeResult.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
  }

  const response = await sendMessage({
    to: emailOrPhone,
    type: messageTypeResult.data,
    payload: {
      code: passcode.code,
    },
  });

  return { dbEntry, metadata, response };
};

export const passcodeExpiration = 10 * 60 * 1000; // 10 minutes.
export const passcodeMaxTryCount = 10;

export const verifyPasscode = async (
  sessionId: string,
  type: VerificationCodeType,
  code: string,
  payload: { phone: string } | { email: string }
): Promise<void> => {
  const passcode = await findUnconsumedPasscodeByJtiAndType(sessionId, type);

  if (!passcode) {
    throw new RequestError('verification_code.not_found');
  }

  if ('phone' in payload && passcode.phone !== payload.phone) {
    throw new RequestError('verification_code.phone_mismatch');
  }

  if ('email' in payload && passcode.email !== payload.email) {
    throw new RequestError('verification_code.email_mismatch');
  }

  if (passcode.createdAt + passcodeExpiration < Date.now()) {
    throw new RequestError('verification_code.expired');
  }

  if (passcode.tryCount >= passcodeMaxTryCount) {
    throw new RequestError('verification_code.exceed_max_try');
  }

  if (code !== passcode.code) {
    await increasePasscodeTryCount(passcode.id);
    throw new RequestError('verification_code.code_mismatch');
  }

  await consumePasscode(passcode.id);
};
