import { type InteractionEvent, type VerificationCodeIdentifier } from '@logto/schemas';

import {
  sendVerificationCode,
  verifyVerificationCode,
} from '#src/api/experience-api/verification-code.js';
import type MockClient from '#src/client/index.js';

import { readConnectorMessage } from '../index.js';

export const successfullySendVerificationCode = async (
  client: MockClient,
  payload: {
    identifier: VerificationCodeIdentifier;
    interactionEvent: InteractionEvent;
  }
) => {
  const { type } = payload.identifier;
  const { verificationId } = await client.send(sendVerificationCode, payload);
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
  client: MockClient,
  payload: {
    identifier: VerificationCodeIdentifier;
    verificationId: string;
    code: string;
  }
) => {
  const { verificationId } = await client.send(verifyVerificationCode, payload);

  expect(verificationId).toBeTruthy();

  return verificationId;
};
