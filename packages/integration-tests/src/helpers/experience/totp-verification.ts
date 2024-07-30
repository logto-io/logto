import { authenticator } from 'otplib';

import { type ExperienceClient } from '#src/client/experience/index.js';

export const successFullyCreateNewTotpSecret = async (client: ExperienceClient) => {
  const { secret, secretQrCode, verificationId } = await client.createTotpSecret();

  expect(secret).toBeTruthy();
  expect(secretQrCode).toBeTruthy();
  expect(verificationId).toBeTruthy();

  return { secret, secretQrCode, verificationId };
};

export const successfullyVerifyTotp = async (
  client: ExperienceClient,
  payload: {
    code: string;
    verificationId?: string;
  }
) => {
  const { verificationId } = await client.verifyTotp(payload);

  expect(verificationId).toBeTruthy();

  return verificationId;
};

export const successfullyCreateAndVerifyTotp = async (client: ExperienceClient) => {
  const { secret, verificationId } = await successFullyCreateNewTotpSecret(client);
  const code = authenticator.generate(secret);

  await successfullyVerifyTotp(client, {
    code,
    verificationId,
  });

  return verificationId;
};
