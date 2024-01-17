import { TemplateType } from '@logto/connector-kit';
import type {
  InteractionEvent,
  RequestVerificationCodePayload,
  VerifyVerificationCodePayload,
} from '@logto/schemas';

import type { PasscodeLibrary } from '#src/libraries/passcode.js';
import type { LogContext } from '#src/middleware/koa-audit-log.js';

/**
 * Refactor Needed:
 * This is a work around to map the latest interaction event type to old TemplateType
 *  */
const eventToTemplateTypeMap: Record<InteractionEvent, TemplateType> = {
  SignIn: TemplateType.SignIn,
  Register: TemplateType.Register,
  ForgotPassword: TemplateType.ForgotPassword,
};

const getTemplateTypeByEvent = (event: InteractionEvent): TemplateType =>
  eventToTemplateTypeMap[event];

export const sendVerificationCodeToIdentifier = async (
  payload: RequestVerificationCodePayload & { event: InteractionEvent },
  jti: string,
  createLog: LogContext['createLog'],
  { createPasscode, sendPasscode }: PasscodeLibrary
) => {
  const { event, ...identifier } = payload;
  const messageType = getTemplateTypeByEvent(event);

  const log = createLog(`Interaction.${event}.Identifier.VerificationCode.Create`);
  log.append(identifier);

  const verificationCode = await createPasscode(jti, messageType, identifier);
  const { dbEntry } = await sendPasscode(verificationCode);

  log.append({ connectorId: dbEntry.id });
};

export const verifyIdentifierByVerificationCode = async (
  payload: VerifyVerificationCodePayload & { event: InteractionEvent },
  jti: string,
  createLog: LogContext['createLog'],
  passcodeLibrary: PasscodeLibrary
) => {
  const { event, verificationCode, ...identifier } = payload;
  const messageType = getTemplateTypeByEvent(event);

  const log = createLog(`Interaction.${event}.Identifier.VerificationCode.Submit`);
  log.append(identifier);

  await passcodeLibrary.verifyPasscode(jti, messageType, verificationCode, identifier);
};
