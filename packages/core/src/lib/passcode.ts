import { Passcode, PasscodeType } from '@logto/schemas';
import { customAlphabet, nanoid } from 'nanoid';

import { getConnectorInstanceByType } from '@/connectors';
import { ConnectorType, EmailConector, SmsConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import {
  deletePasscodesByIds,
  findUnconsumedPasscodeBySessionIdAndType,
  findUnconsumedPasscodesBySessionIdAndType,
  insertPasscode,
  updatePasscode,
} from '@/queries/passcode';

export const passcodeLength = 6;
const randomCode = customAlphabet('1234567890', passcodeLength);

export const createPasscode = async (
  sessionId: string,
  type: PasscodeType,
  payload: { phone: string } | { email: string }
) => {
  // Disable existing passcodes.
  const passcodes = await findUnconsumedPasscodesBySessionIdAndType(sessionId, type);

  if (passcodes.length > 0) {
    await deletePasscodesByIds(passcodes.map(({ id }) => id));
  }

  return insertPasscode({
    id: nanoid(),
    sessionId,
    type,
    code: randomCode(),
    ...payload,
  });
};

export const sendPasscode = async (passcode: Passcode) => {
  const emailOrPhone = passcode.email ?? passcode.phone;

  if (!emailOrPhone) {
    throw new RequestError('passcode.phone_email_empty');
  }

  const connector = passcode.email
    ? await getConnectorInstanceByType<EmailConector>(ConnectorType.Email)
    : await getConnectorInstanceByType<SmsConnector>(ConnectorType.SMS);

  return connector.sendMessage(emailOrPhone, passcode.type, {
    code: passcode.code,
  });
};

export const passcodeExpiration = 10 * 60 * 1000; // 10 minutes.
export const passcodeMaxTryCount = 10;

export const verifyPasscode = async (
  sessionId: string,
  type: PasscodeType,
  code: string,
  payload: { phone: string } | { email: string }
): Promise<void> => {
  const passcode = await findUnconsumedPasscodeBySessionIdAndType(sessionId, type);

  if (!passcode) {
    throw new RequestError('passcode.not_found');
  }

  if ('phone' in payload && passcode.phone !== payload.phone) {
    throw new RequestError('passcode.phone_mismatch');
  }

  if ('email' in payload && passcode.email !== payload.email) {
    throw new RequestError('passcode.email_mismatch');
  }

  if (passcode.createdAt + passcodeExpiration < Date.now()) {
    throw new RequestError('passcode.expired');
  }

  if (passcode.tryCount >= passcodeMaxTryCount) {
    throw new RequestError('passcode.exceed_max_try');
  }

  if (code !== passcode.code) {
    // TODO use SQL's native +1
    await updatePasscode({ where: { id: passcode.id }, set: { tryCount: passcode.tryCount + 1 } });
    throw new RequestError('passcode.code_mismatch');
  }

  await updatePasscode({ where: { id: passcode.id }, set: { consumed: true } });
};
