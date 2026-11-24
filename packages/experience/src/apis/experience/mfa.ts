import {
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  type VerificationType,
  type WebAuthnRegistrationOptions,
  type WebAuthnAuthenticationOptions,
  type BindMfaPayload,
  type VerifyMfaPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';
import { submitInteraction } from './interaction';
import { verifySubjectVerificationCode } from './subject-verification-code';

export const addMfa = async (type: MfaFactor, verificationId: string) =>
  api.post(`${experienceApiRoutes.mfa}`, {
    json: {
      type,
      verificationId,
    },
  });

type SanitizedVerificationRecord = {
  id?: unknown;
  type?: unknown;
  verified?: unknown;
};

type InteractionStateResponse = {
  interactionEvent?: unknown;
  verificationRecords?: unknown;
};

/**
 * Return the verified email/phone verification record ID from the current `Register`
 * interaction, if one exists, so enrolling that same identifier for MFA needs no second code.
 */
export const getVerifiedRegisterCodeRecordId = async (
  verificationType: VerificationType.EmailVerificationCode | VerificationType.PhoneVerificationCode
): Promise<string | undefined> => {
  const { interactionEvent, verificationRecords } = await api
    .get(experienceApiRoutes.interaction)
    .json<InteractionStateResponse>();

  if (interactionEvent !== InteractionEvent.Register || !Array.isArray(verificationRecords)) {
    return;
  }

  const matched = verificationRecords.find(
    (record): record is SanitizedVerificationRecord =>
      typeof record === 'object' &&
      record !== null &&
      'type' in record &&
      record.type === verificationType &&
      'verified' in record &&
      record.verified === true &&
      'id' in record &&
      typeof record.id === 'string'
  );

  return typeof matched?.id === 'string' ? matched.id : undefined;
};

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

export const enableMfa = async () => {
  await api.post(`${experienceApiRoutes.mfa}/mfa-enabled`);
  return submitInteraction();
};

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

export const bindMfaByVerificationCode = async (
  verificationId: string,
  code: string,
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone
) => {
  const { verificationId: verifiedId } = await verifySubjectVerificationCode({
    type: identifierType,
    code,
    verificationId,
  });

  const factor =
    identifierType === SignInIdentifier.Email
      ? MfaFactor.EmailVerificationCode
      : MfaFactor.PhoneVerificationCode;

  return bindMfa(factor, verifiedId);
};
