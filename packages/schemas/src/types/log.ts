import { z } from 'zod';

import type { Log } from '../db-entries';

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

export const logResultGuard = z.nativeEnum(LogResult);

export const baseLogPayloadGuard = z.object({
  result: logResultGuard.optional(),
  error: z.record(z.string(), z.unknown()).optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  applicationId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type BaseLogPayload = z.infer<typeof baseLogPayloadGuard>;

const arbitraryLogPayloadGuard = z.record(z.string(), z.unknown());

export type ArbitraryLogPayload = z.infer<typeof arbitraryLogPayloadGuard>;

const registerUsernamePasswordLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({ userId: z.string().optional(), username: z.string().optional() })
);

const registerEmailSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({ email: z.string().optional(), connectorId: z.string().optional() })
);

const registerEmailLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    email: z.string().optional(),
    code: z.string().optional(),
    userId: z.string().optional(),
  })
);

const registerSmsSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
    connectorId: z.string().optional(),
  })
);

const registerSmsLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
    code: z.string().optional(),
    userId: z.string().optional(),
  })
);

const registerSocialBindLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    connectorId: z.string().optional(),
    userId: z.string().optional(),
    userInfo: z.unknown().optional(),
  })
);

const registerSocialLogPayloadGuard = registerSocialBindLogPayloadGuard.and(
  z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    redirectUri: z.string().optional(),
    redirectTo: z.string().optional(),
  })
);

const signInUsernamePasswordLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    userId: z.string().optional(),
    username: z.string().optional(),
  })
);

const signInEmailPasswordLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    userId: z.string().optional(),
    email: z.string().optional(),
  })
);

const signInSmsPasswordLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    userId: z.string().optional(),
    sms: z.string().optional(),
  })
);

const signInEmailSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    email: z.string().optional(),
    connectorId: z.string().optional(),
  })
);

const signInEmailLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    email: z.string().optional(),
    code: z.string().optional(),
    userId: z.string().optional(),
  })
);

const signInSmsSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
    connectorId: z.string().optional(),
  })
);

const signInSmsLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
    code: z.string().optional(),
    userId: z.string().optional(),
  })
);

const signInSocialBindLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    connectorId: z.string().optional(),
    userId: z.string().optional(),
    userInfo: z.unknown().optional(),
  })
);

const signInSocialLogPayloadGuard = signInSocialBindLogPayloadGuard.and(
  z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    redirectUri: z.string().optional(),
    redirectTo: z.string().optional(),
  })
);

const forgotPasswordSmsSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
    connectorId: z.string().optional(),
  })
);

const forgotPasswordSmsLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
    code: z.string().optional(),
    userId: z.string().optional(),
  })
);

const forgotPasswordEmailSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    email: z.string().optional(),
    connectorId: z.string().optional(),
  })
);

const forgotPasswordEmailLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    email: z.string().optional(),
    code: z.string().optional(),
    userId: z.string().optional(),
  })
);

const forgotPasswordResetLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    userId: z.string().optional(),
  })
);

const continueEmailSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    email: z.string().optional(),
  })
);

const continueSmsSendPasscodeLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
  })
);

const continueEmailLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    email: z.string().optional(),
  })
);

const continueSmsLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    phone: z.string().optional(),
  })
);

export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  IdToken = 'IdToken',
}

export const tokenTypeGuard = z.nativeEnum(TokenType);

const exchangeTokenLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    userId: z.string().optional(),
    params: z.record(z.string(), z.unknown()).optional(),
    issued: tokenTypeGuard.array().optional(),
    scope: z.string().optional(),
  })
);

const revokeTokenLogPayloadGuard = arbitraryLogPayloadGuard.and(
  z.object({
    userId: z.string().optional(),
    params: z.record(z.string(), z.unknown()).optional(),
    tokenType: tokenTypeGuard.optional(),
    grantId: z.string().optional(),
  })
);

const logPayloadsGuard = z.object({
  RegisterUsernamePassword: registerUsernamePasswordLogPayloadGuard,
  RegisterEmailSendPasscode: registerEmailSendPasscodeLogPayloadGuard,
  RegisterEmail: registerEmailLogPayloadGuard,
  RegisterSmsSendPasscode: registerSmsSendPasscodeLogPayloadGuard,
  RegisterSms: registerSmsLogPayloadGuard,
  RegisterSocialBind: registerSocialBindLogPayloadGuard,
  RegisterSocial: registerSocialLogPayloadGuard,
  SignInUsernamePassword: signInUsernamePasswordLogPayloadGuard,
  SignInEmailPassword: signInEmailPasswordLogPayloadGuard,
  SignInSmsPassword: signInSmsPasswordLogPayloadGuard,
  SignInEmailSendPasscode: signInEmailSendPasscodeLogPayloadGuard,
  SignInEmail: signInEmailLogPayloadGuard,
  SignInSmsSendPasscode: signInSmsSendPasscodeLogPayloadGuard,
  SignInSms: signInSmsLogPayloadGuard,
  SignInSocialBind: signInSocialBindLogPayloadGuard,
  SignInSocial: signInSocialLogPayloadGuard,
  ForgotPasswordSmsSendPasscode: forgotPasswordSmsSendPasscodeLogPayloadGuard,
  ForgotPasswordSms: forgotPasswordSmsLogPayloadGuard,
  ForgotPasswordEmailSendPasscode: forgotPasswordEmailSendPasscodeLogPayloadGuard,
  ForgotPasswordEmail: forgotPasswordEmailLogPayloadGuard,
  ForgotPasswordReset: forgotPasswordResetLogPayloadGuard,
  ContinueEmailSendPasscode: continueEmailSendPasscodeLogPayloadGuard,
  ContinueSmsSendPasscode: continueSmsSendPasscodeLogPayloadGuard,
  ContinueEmail: continueEmailLogPayloadGuard,
  ContinueSms: continueSmsLogPayloadGuard,
  CodeExchangeToken: exchangeTokenLogPayloadGuard,
  RefreshTokenExchangeToken: exchangeTokenLogPayloadGuard,
  RevokeToken: revokeTokenLogPayloadGuard,
});

export type LogPayloads = z.infer<typeof logPayloadsGuard>;

export const logTypeGuard = logPayloadsGuard.keyof();

export type LogType = z.infer<typeof logTypeGuard>;

export type LogPayload = LogPayloads[LogType];

export type LogDto = Omit<Log, 'payload'> & {
  payload: {
    userId?: string;
    applicationId?: string;
    result?: string;
    userAgent?: string;
    ip?: string;
  };
};
