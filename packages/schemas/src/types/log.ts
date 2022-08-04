// FIXME: @IceHe
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Log } from '../db-entries';

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

export interface BaseLogPayload {
  result?: LogResult;
  error?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  applicationId?: string;
  sessionId?: string;
}

type ArbitraryLogPayload = Record<string, unknown>;

interface RegisterUsernamePasswordLogPayload extends ArbitraryLogPayload {
  userId?: string;
  username?: string;
}

interface RegisterEmailSendPasscodeLogPayload extends ArbitraryLogPayload {
  email?: string;
  connectorId?: string;
}

interface RegisterEmailLogPayload extends ArbitraryLogPayload {
  email?: string;
  code?: string;
  userId?: string;
}

interface RegisterSmsSendPasscodeLogPayload extends ArbitraryLogPayload {
  phone?: string;
  connectorId?: string;
}

interface RegisterSmsLogPayload extends ArbitraryLogPayload {
  phone?: string;
  code?: string;
  userId?: string;
}

interface RegisterSocialBindLogPayload extends ArbitraryLogPayload {
  connectorId?: string;
  userInfo?: object;
  userId?: string;
}

interface RegisterSocialLogPayload extends RegisterSocialBindLogPayload {
  code?: string;
  state?: string;
  redirectUri?: string;
  redirectTo?: string;
}

interface SignInUsernamePasswordLogPayload extends ArbitraryLogPayload {
  userId?: string;
  username?: string;
}

interface SignInEmailSendPasscodeLogPayload extends ArbitraryLogPayload {
  email?: string;
  connectorId?: string;
}

interface SignInEmailLogPayload extends ArbitraryLogPayload {
  email?: string;
  code?: string;
  userId?: string;
}

interface SignInSmsSendPasscodeLogPayload extends ArbitraryLogPayload {
  phone?: string;
  connectorId?: string;
}

interface SignInSmsLogPayload extends ArbitraryLogPayload {
  phone?: string;
  code?: string;
  userId?: string;
}

interface SignInSocialBindLogPayload extends ArbitraryLogPayload {
  connectorId?: string;
  userInfo?: object;
  userId?: string;
}

interface SignInSocialLogPayload extends SignInSocialBindLogPayload {
  code?: string;
  state?: string;
  redirectUri?: string;
  redirectTo?: string;
}

export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  IdToken = 'IdToken',
}

interface ExchangeTokenLogPayload extends ArbitraryLogPayload {
  userId?: string;
  params?: Record<string, unknown>;
  issued?: TokenType[];
  scope?: string;
}

interface RevokeTokenLogPayload extends ArbitraryLogPayload {
  userId?: string;
  params?: Record<string, unknown>;
  grantId?: string;
  tokenType?: TokenType;
}

export type LogPayloads = {
  RegisterUsernamePassword: RegisterUsernamePasswordLogPayload;
  RegisterEmailSendPasscode: RegisterEmailSendPasscodeLogPayload;
  RegisterEmail: RegisterEmailLogPayload;
  RegisterSmsSendPasscode: RegisterSmsSendPasscodeLogPayload;
  RegisterSms: RegisterSmsLogPayload;
  RegisterSocialBind: RegisterSocialBindLogPayload;
  RegisterSocial: RegisterSocialLogPayload;
  SignInUsernamePassword: SignInUsernamePasswordLogPayload;
  SignInEmailSendPasscode: SignInEmailSendPasscodeLogPayload;
  SignInEmail: SignInEmailLogPayload;
  SignInSmsSendPasscode: SignInSmsSendPasscodeLogPayload;
  SignInSms: SignInSmsLogPayload;
  SignInSocialBind: SignInSocialBindLogPayload;
  SignInSocial: SignInSocialLogPayload;
  CodeExchangeToken: ExchangeTokenLogPayload;
  RefreshTokenExchangeToken: ExchangeTokenLogPayload;
  RevokeToken: RevokeTokenLogPayload;
};

export type LogType = keyof LogPayloads;

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
/* eslint-enable @typescript-eslint/consistent-type-definitions */
