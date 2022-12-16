import type { Event } from '@logto/schemas';
import { interaction, PasscodeType } from '@logto/schemas';

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
  log: LogContext['log']
) => {
  const { event, ...identifier } = payload;
  const passcodeType = getPasscodeTypeByEvent(event);
  // TODO: @Simeng this can be refactored
  const identifierType =
    'email' in identifier ? interaction.Identifier.Email : interaction.Identifier.Phone;

  log.setKey(`${event}.${identifierType}.Passcode.Create`);
  log(identifier);

  const passcode = await createPasscode(jti, passcodeType, identifier);

  const { dbEntry } = await sendPasscode(passcode);

  log({ connectorId: dbEntry.id });
};

export const verifyIdentifierByPasscode = async (
  payload: PasscodeIdentifierPayload & { event: Event },
  jti: string,
  log: LogContext['log']
) => {
  const { event, passcode, ...identifier } = payload;
  const passcodeType = getPasscodeTypeByEvent(event);
  // TODO: @Simeng this can be refactored

  const identifierType =
    'email' in identifier ? interaction.Identifier.Email : interaction.Identifier.Phone;

  log.setKey(`${event}.${identifierType}.Passcode.Submit`);

  await verifyPasscode(jti, passcodeType, passcode, identifier);
};
