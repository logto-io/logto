import { VerificationCodeType } from '@logto/connector-kit';
import type { InteractionEvent } from '@logto/schemas';

import { createPasscode, sendPasscode, verifyPasscode } from '#src/libraries/passcode.js';
import type { LogContext } from '#src/middleware/koa-audit-log.js';

import type {
  SendVerificationCodePayload,
  VerificationCodeIdentifierPayload,
} from '../types/index.js';

/**
 * Refactor Needed:
 * This is a work around to map the latest interaction event type to old VerificationCodeType
 *  */
const eventToVerificationCodeTypeMap: Record<InteractionEvent, VerificationCodeType> = {
  SignIn: VerificationCodeType.SignIn,
  Register: VerificationCodeType.Register,
  ForgotPassword: VerificationCodeType.ForgotPassword,
};

const getVerificationCodeTypeByEvent = (event: InteractionEvent): VerificationCodeType =>
  eventToVerificationCodeTypeMap[event];

export const sendVerificationCodeToIdentifier = async (
  payload: SendVerificationCodePayload & { event: InteractionEvent },
  jti: string,
  createLog: LogContext['createLog']
) => {
  const { event, ...identifier } = payload;
  const messageType = getVerificationCodeTypeByEvent(event);

  const log = createLog(`Interaction.${event}.Identifier.VerificationCode.Create`);
  log.append(identifier);

  const verificationCode = await createPasscode(jti, messageType, identifier);
  const { dbEntry } = await sendPasscode(verificationCode);

  log.append({ connectorId: dbEntry.id });
};

export const verifyIdentifierByVerificationCode = async (
  payload: VerificationCodeIdentifierPayload & { event: InteractionEvent },
  jti: string,
  createLog: LogContext['createLog']
) => {
  const { event, verificationCode, ...identifier } = payload;
  const messageType = getVerificationCodeTypeByEvent(event);

  const log = createLog(`Interaction.${event}.Identifier.VerificationCode.Submit`);
  log.append(identifier);

  await verifyPasscode(jti, messageType, verificationCode, identifier);
};
