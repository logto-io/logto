import { SignInIdentifier, TemplateType } from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export const verifyPassword = async (accessToken: string, password: string) => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/password', {
      json: { password },
    })
    .json<{
      verificationRecordId: string;
      expiresAt: string;
    }>();
};

export const sendEmailVerificationCode = async (accessToken: string, email: string) => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/verification-code', {
      json: {
        identifier: {
          type: SignInIdentifier.Email,
          value: email,
        },
        templateType: TemplateType.UserPermissionValidation,
      },
    })
    .json<{
      verificationRecordId: string;
      expiresAt: string;
    }>();
};

export const sendPhoneVerificationCode = async (accessToken: string, phone: string) => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/verification-code', {
      json: {
        identifier: {
          type: SignInIdentifier.Phone,
          value: phone,
        },
        templateType: TemplateType.UserPermissionValidation,
      },
    })
    .json<{
      verificationRecordId: string;
      expiresAt: string;
    }>();
};

export const verifyEmailVerificationCode = async (
  accessToken: string,
  payload: {
    verificationRecordId: string;
    code: string;
    email: string;
  }
) => {
  const { verificationRecordId, code, email } = payload;

  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/verification-code/verify', {
      json: {
        identifier: {
          type: SignInIdentifier.Email,
          value: email,
        },
        verificationId: verificationRecordId,
        code,
      },
    })
    .json<{
      verificationRecordId: string;
    }>();
};

export const verifyPhoneVerificationCode = async (
  accessToken: string,
  payload: {
    verificationRecordId: string;
    code: string;
    phone: string;
  }
) => {
  const { verificationRecordId, code, phone } = payload;

  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/verification-code/verify', {
      json: {
        identifier: {
          type: SignInIdentifier.Phone,
          value: phone,
        },
        verificationId: verificationRecordId,
        code,
      },
    })
    .json<{
      verificationRecordId: string;
    }>();
};
