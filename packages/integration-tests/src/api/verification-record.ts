import { type SignInIdentifier } from '@logto/schemas';
import { type KyInstance } from 'ky';

import { readConnectorMessage } from '#src/helpers/index.js';

export const createVerificationRecordByPassword = async (api: KyInstance, password: string) => {
  const { verificationRecordId } = await api
    .post('api/verifications/password', {
      json: {
        password,
      },
    })
    .json<{ verificationRecordId: string }>();

  return verificationRecordId;
};

const createVerificationCode = async (
  api: KyInstance,
  identifier: { type: SignInIdentifier; value: string }
) => {
  const { verificationRecordId } = await api
    .post('api/verifications/verification-code', {
      json: {
        identifier: {
          type: identifier.type,
          value: identifier.value,
        },
      },
    })
    .json<{ verificationRecordId: string }>();

  return verificationRecordId;
};

const verifyVerificationCode = async (
  api: KyInstance,
  code: string,
  identifier: { type: SignInIdentifier; value: string },
  verificationId: string
) => {
  const { verificationRecordId } = await api
    .post('api/verifications/verification-code/verify', {
      json: {
        code,
        identifier,
        verificationId,
      },
    })
    .json<{ verificationRecordId: string }>();

  return verificationRecordId;
};

export const createAndVerifyVerificationCode = async (
  api: KyInstance,
  identifier: { type: SignInIdentifier; value: string }
) => {
  const verificationRecordId = await createVerificationCode(api, identifier);
  const { code, phone, address } = await readConnectorMessage(
    identifier.type === 'email' ? 'Email' : 'Sms'
  );

  expect(code).toBeTruthy();
  expect(identifier.type === 'email' ? address : phone).toBe(identifier.value);

  await verifyVerificationCode(api, code, identifier, verificationRecordId);

  return verificationRecordId;
};
