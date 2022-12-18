import type { Event } from '@logto/schemas';
import { PasscodeType } from '@logto/schemas';

import { createPasscode, sendPasscode, verifyPasscode } from '#src/libraries/passcode.js';
import type { LogContext } from '#src/middleware/koa-audit-log.js';

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
  createLog: LogContext['createLog']
) => {
  const { event, ...identifier } = payload;
  const passcodeType = getPasscodeTypeByEvent(event);

  const log = createLog(`Interaction.${event}.Identifier.VerificationCode.Create`);
  log.append(identifier);

  const passcode = await createPasscode(jti, passcodeType, identifier);
  const { dbEntry } = await sendPasscode(passcode);

  log.append({ connectorId: dbEntry.id });
};

export const verifyIdentifierByPasscode = async (
  payload: PasscodeIdentifierPayload & { event: Event },
  jti: string,
  createLog: LogContext['createLog']
) => {
  const { event, passcode, ...identifier } = payload;
  const passcodeType = getPasscodeTypeByEvent(event);

  // TODO: @Simeng maybe we should just log all interaction payload in every request?
  const log = createLog(`Interaction.${event}.Identifier.VerificationCode.Submit`);
  log.append(identifier);

  await verifyPasscode(jti, passcodeType, passcode, identifier);
};
