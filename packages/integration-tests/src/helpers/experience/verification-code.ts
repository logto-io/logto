import { type InteractionEvent, type VerificationCodeIdentifier } from '@logto/schemas';

import { type ExperienceClient } from '#src/client/experience/index.js';

import { readConnectorMessage } from '../index.js';

export const successfullySendVerificationCode = async (
  client: ExperienceClient,
  payload: {
    identifier: VerificationCodeIdentifier;
    interactionEvent: InteractionEvent;
  }
) => {
  const { type } = payload.identifier;
  const { verificationId } = await client.sendVerificationCode(payload);
  const { code, phone, address } = await readConnectorMessage(type === 'email' ? 'Email' : 'Sms');

  expect(verificationId).toBeTruthy();
  expect(code).toBeTruthy();

  expect(payload.identifier.type === 'email' ? address : phone).toBe(payload.identifier.value);

  return {
    verificationId,
    code,
  };
};

export const successfullyVerifyVerificationCode = async (
  client: ExperienceClient,
  payload: {
    identifier: VerificationCodeIdentifier;
    verificationId: string;
    code: string;
  }
) => {
  const { verificationId } = await client.verifyVerificationCode(payload);

  expect(verificationId).toBeTruthy();

  return verificationId;
};
