import {
  MfaFactor,
  type SignInIdentifier,
  type WebAuthnRegistrationOptions,
  type WebAuthnAuthenticationOptions,
  type BindMfaPayload,
  type VerifyMfaPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';
import { submitInteraction } from './interaction';

const addMfa = async (type: MfaFactor, verificationId: string) =>
  api.post(`${experienceApiRoutes.mfa}`, {
    json: {
      type,
      verificationId,
    },
  });

type TotpSecretResponse = {
  verificationId: string;
  secret: string;
  secretQrCode: string;
};
export const createTotpSecret = async () =>
  api.post(`${experienceApiRoutes.verification}/totp/secret`).json<TotpSecretResponse>();

export const createWebAuthnRegistration = async () => {
  const { verificationId, registrationOptions } = await api
    .post(`${experienceApiRoutes.verification}/web-authn/registration`)
    .json<{ verificationId: string; registrationOptions: WebAuthnRegistrationOptions }>();

  return {
    verificationId,
    options: registrationOptions,
  };
};

export const createWebAuthnAuthentication = async () => {
  const { verificationId, authenticationOptions } = await api
    .post(`${experienceApiRoutes.verification}/web-authn/authentication`)
    .json<{ verificationId: string; authenticationOptions: WebAuthnAuthenticationOptions }>();

  return {
    verificationId,
    options: authenticationOptions,
  };
};

export const createBackupCode = async () =>
  api.post(`${experienceApiRoutes.verification}/backup-code/generate`).json<{
    verificationId: string;
    codes: string[];
  }>();

export const skipMfa = async () => {
  await api.post(`${experienceApiRoutes.mfa}/mfa-skipped`);
  return submitInteraction();
};

export const skipMfaSuggestion = async () => {
  await api.post(`${experienceApiRoutes.mfa}/mfa-suggestion-skipped`);
  return submitInteraction();
};

export const bindMfa = async (
  type: MfaFactor,
  verificationId: string,
  payload?: BindMfaPayload
) => {
  if (payload) {
    switch (payload.type) {
      case MfaFactor.TOTP: {
        const { code } = payload;
        await api.post(`${experienceApiRoutes.verification}/totp/verify`, {
          json: {
            code,
            verificationId,
          },
        });
        break;
      }
      case MfaFactor.WebAuthn: {
        await api.post(`${experienceApiRoutes.verification}/web-authn/registration/verify`, {
          json: {
            verificationId,
            payload,
          },
        });
        break;
      }
      case MfaFactor.BackupCode: {
        // No need to verify backup codes
        break;
      }
    }
  }

  await addMfa(type, verificationId);
  return submitInteraction();
};

export const verifyMfa = async (payload: VerifyMfaPayload, verificationId?: string) => {
  switch (payload.type) {
    case MfaFactor.TOTP: {
      const { code } = payload;
      await api.post(`${experienceApiRoutes.verification}/totp/verify`, {
        json: {
          code,
        },
      });
      break;
    }
    case MfaFactor.WebAuthn: {
      await api.post(`${experienceApiRoutes.verification}/web-authn/authentication/verify`, {
        json: {
          verificationId,
          payload,
        },
      });
      break;
    }
    case MfaFactor.BackupCode: {
      const { code } = payload;
      await api.post(`${experienceApiRoutes.verification}/backup-code/verify`, {
        json: {
          code,
        },
      });
      break;
    }
  }

  return submitInteraction();
};

// Email/Phone MFA verification code
export const sendMfaVerificationCode = async (
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone
) =>
  api
    .post(`${experienceApiRoutes.verification}/mfa-verification-code`, {
      json: { identifierType },
    })
    .json<{ verificationId: string }>();

export const verifyMfaByVerificationCode = async (
  verificationId: string,
  code: string,
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone
) => {
  await api.post(`${experienceApiRoutes.verification}/mfa-verification-code/verify`, {
    json: { verificationId, code, identifierType },
  });
  return submitInteraction();
};
