import {
  type InteractionEvent,
  type VerificationCodeIdentifier,
  SignInIdentifier,
} from '@logto/schemas';

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

export const successfullySendMfaVerificationCode = async (
  client: ExperienceClient,
  payload: {
    identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
    expectedIdentifierValue: string;
  }
) => {
  const { identifierType, expectedIdentifierValue } = payload;
  const { verificationId } = await client.sendMfaVerificationCode({ identifierType });
  const { code, phone, address } = await readConnectorMessage(
    identifierType === SignInIdentifier.Email ? 'Email' : 'Sms'
  );

  expect(verificationId).toBeTruthy();
  expect(code).toBeTruthy();

  // Verify the code was sent to the expected bound identifier
  expect(identifierType === SignInIdentifier.Email ? address : phone).toBe(expectedIdentifierValue);

  return {
    verificationId,
    code,
  };
};

export const successfullyVerifyMfaVerificationCode = async (
  client: ExperienceClient,
  payload: {
    identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
    verificationId: string;
    code: string;
  }
) => {
  const { verificationId } = await client.verifyMfaVerificationCode(payload);

  expect(verificationId).toBeTruthy();

  return verificationId;
};
