import { ConnectorType } from '@logto/connector-schemas';
import { Passcode, PasscodeType } from '@logto/schemas';
import { customAlphabet, nanoid } from 'nanoid';

import { getConnectorInstances } from '@/connectors';
import { EmailConnectorInstance, SmsConnectorInstance } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import {
  consumePasscode,
  deletePasscodesByIds,
  findUnconsumedPasscodeByJtiAndType,
  findUnconsumedPasscodesByJtiAndType,
  increasePasscodeTryCount,
  insertPasscode,
} from '@/queries/passcode';
import assertThat from '@/utils/assert-that';

export const passcodeLength = 6;
const randomCode = customAlphabet('1234567890', passcodeLength);

export const createPasscode = async (
  jti: string,
  type: PasscodeType,
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
    throw new RequestError('passcode.phone_email_empty');
  }

  const connectorInstances = await getConnectorInstances();

  const emailConnectorInstance = connectorInstances.find(
    (connector): connector is EmailConnectorInstance =>
      connector.connector.enabled && connector.metadata.type === ConnectorType.Email
  );
  const smsConnectorInstance = connectorInstances.find(
    (connector): connector is SmsConnectorInstance =>
      connector.connector.enabled && connector.metadata.type === ConnectorType.SMS
  );

  const connectorInstance = passcode.email ? emailConnectorInstance : smsConnectorInstance;

  assertThat(
    connectorInstance,
    new RequestError({
      code: 'connector.not_found',
      type: passcode.email ? ConnectorType.Email : ConnectorType.SMS,
    })
  );

  const { connector, metadata, sendMessage } = connectorInstance;

  const response = await sendMessage({
    to: emailOrPhone,
    type: passcode.type,
    payload: {
      code: passcode.code,
    },
  });

  return { connector, metadata, response };
};

export const passcodeExpiration = 10 * 60 * 1000; // 10 minutes.
export const passcodeMaxTryCount = 10;

export const verifyPasscode = async (
  sessionId: string,
  type: PasscodeType,
  code: string,
  payload: { phone: string } | { email: string }
): Promise<void> => {
  const passcode = await findUnconsumedPasscodeByJtiAndType(sessionId, type);

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
    await increasePasscodeTryCount(passcode.id);
    throw new RequestError('passcode.code_mismatch');
  }

  await consumePasscode(passcode.id);
};
