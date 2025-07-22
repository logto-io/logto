import {
  type WebAuthnRegistrationOptions,
  type SignInIdentifier,
  type BindWebAuthnPayload,
} from '@logto/schemas';
import { type KyInstance } from 'ky';

import { readConnectorMessage } from '#src/helpers/index.js';

export const createVerificationRecordByPassword = async (api: KyInstance, password: string) => {
  const { verificationRecordId, expiresAt } = await api
    .post('api/verifications/password', {
      json: {
        password,
      },
    })
    .json<{ verificationRecordId: string; expiresAt: string }>();
  expect(expiresAt).toBeTruthy();

  return verificationRecordId;
};

const createVerificationCode = async (
  api: KyInstance,
  identifier: { type: SignInIdentifier; value: string }
) => {
  const { verificationRecordId, expiresAt } = await api
    .post('api/verifications/verification-code', {
      json: {
        identifier: {
          type: identifier.type,
          value: identifier.value,
        },
      },
    })
    .json<{ verificationRecordId: string; expiresAt: string }>();
  expect(expiresAt).toBeTruthy();

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

export const createSocialVerificationRecord = async (
  api: KyInstance,
  connectorId: string,
  state: string,
  redirectUri: string,
  scope?: string
) => {
  const { verificationRecordId, authorizationUri, expiresAt } = await api
    .post('api/verifications/social', {
      json: { connectorId, state, redirectUri, scope },
    })
    .json<{ verificationRecordId: string; authorizationUri: string; expiresAt: string }>();

  expect(expiresAt).toBeTruthy();
  expect(authorizationUri).toBeTruthy();

  return { verificationRecordId, authorizationUri };
};

export const verifySocialAuthorization = async (
  api: KyInstance,
  verificationRecordId: string,
  connectorData: Record<string, unknown>
) => {
  await api.post('api/verifications/social/verify', {
    json: { verificationRecordId, connectorData },
  });
};

export const createWebAuthnRegistrationOptions = async (api: KyInstance) => {
  const { verificationRecordId, registrationOptions } = await api
    .post('api/verifications/web-authn/registration', {})
    .json<{ verificationRecordId: string; registrationOptions: WebAuthnRegistrationOptions }>();

  return { verificationRecordId, registrationOptions };
};

export const verifyWebAuthnRegistration = async (
  api: KyInstance,
  verificationRecordId: string,
  payload: BindWebAuthnPayload
) => {
  await api.post('api/verifications/web-authn/registration/verify', {
    json: { verificationRecordId, payload },
  });
};
