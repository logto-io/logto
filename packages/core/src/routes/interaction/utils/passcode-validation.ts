import { PasscodeType } from '@logto/schemas';
import type { Event } from '@logto/schemas';

import { createPasscode, sendPasscode } from '#src/lib/passcode.js';
import type { LogContext } from '#src/middleware/koa-log.js';
import { getPasswordlessRelatedLogType } from '#src/routes/session/utils.js';

import type { SendPasscodePayload } from '../types/guard.js';

/**
 * Refactor Needed:
 * This is a work around to map the latest interaction event type to old PasscodeType
 *  */
const eventToPasscodeTypeMap: Record<Event, PasscodeType> = {
  'sign-in': PasscodeType.SignIn,
  register: PasscodeType.Register,
  'forgot-password': PasscodeType.ForgotPassword,
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

  const passcode = await createPasscode(jti, passcodeType, identifier);

  const { dbEntry } = await sendPasscode(passcode);

  log(logType, { connectorId: dbEntry.id });
};
