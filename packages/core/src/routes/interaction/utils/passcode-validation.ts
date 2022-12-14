import type { Event } from '@logto/schemas';
import { PasscodeType } from '@logto/schemas';

import { createPasscode, sendPasscode, verifyPasscode } from '#src/libraries/passcode.js';
import type { LogContext } from '#src/middleware/koa-log.js';
import { getPasswordlessRelatedLogType } from '#src/routes/session/utils.js';

import type { SendPasscodePayload, PasscodeIdentifierPayload } from '../types/index.js';

/**
 * Refactor Needed:
 * This is a work around to map the latest interaction event type to old PasscodeType
 *  */
const eventToPasscodeTypeMap: Record<Event, PasscodeType> = {
  SignIn: PasscodeType.SignIn,
  Register: PasscodeType.Register,
  ForgotPassword: PasscodeType.ForgotPassword,
};

const getPasscodeTypeByEvent = (event: Event): PasscodeType => eventToPasscodeTypeMap[event];

export const sendPasscodeToIdentifier = async (
  payload: SendPasscodePayload,
  jti: string,
  log: LogContext['log']
) => {
  const { event, ...identifier } = payload;
  const passcodeType = getPasscodeTypeByEvent(event);

  const logType = getPasswordlessRelatedLogType(
    passcodeType,
    'email' in identifier ? 'email' : 'sms',
    'send'
  );

  log(logType, identifier);

  const passcode = await createPasscode(jti, passcodeType, identifier);

  const { dbEntry } = await sendPasscode(passcode);

  log(logType, { connectorId: dbEntry.id });
};

export const verifyIdentifierByPasscode = async (
  payload: PasscodeIdentifierPayload & { event: Event },
  jti: string,
  log: LogContext['log']
) => {
  const { event, passcode, ...identifier } = payload;
  const passcodeType = getPasscodeTypeByEvent(event);

  const logType = getPasswordlessRelatedLogType(
    passcodeType,
    'email' in identifier ? 'email' : 'sms',
    'verify'
  );

  log(logType, identifier);

  await verifyPasscode(jti, passcodeType, passcode, identifier);
};
