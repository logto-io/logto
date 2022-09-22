import { Log } from '../db-entries';

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

export type BaseLogPayload = {
  result?: LogResult;
  error?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  applicationId?: string;
  sessionId?: string;
};

type ArbitraryLogPayload = Record<string, unknown>;

type RegisterUsernamePasswordLogPayload = ArbitraryLogPayload & {
  userId?: string;
  username?: string;
};

type RegisterEmailSendPasscodeLogPayload = ArbitraryLogPayload & {
  email?: string;
  connectorId?: string;
};

type RegisterEmailLogPayload = ArbitraryLogPayload & {
  email?: string;
  code?: string;
  userId?: string;
};

type RegisterSmsSendPasscodeLogPayload = {
  phone?: string;
  connectorId?: string;
} & ArbitraryLogPayload;

type RegisterSmsLogPayload = ArbitraryLogPayload & {
  phone?: string;
  code?: string;
  userId?: string;
};

type RegisterSocialBindLogPayload = ArbitraryLogPayload & {
  connectorId?: string;
  userInfo?: object;
  userId?: string;
};

type RegisterSocialLogPayload = RegisterSocialBindLogPayload & {
  code?: string;
  state?: string;
  redirectUri?: string;
  redirectTo?: string;
};

type SignInUsernamePasswordLogPayload = ArbitraryLogPayload & {
  userId?: string;
  username?: string;
};

type SignInEmailSendPasscodeLogPayload = ArbitraryLogPayload & {
  email?: string;
  connectorId?: string;
};

type SignInEmailLogPayload = ArbitraryLogPayload & {
  email?: string;
  code?: string;
  userId?: string;
};

type SignInSmsSendPasscodeLogPayload = ArbitraryLogPayload & {
  phone?: string;
  connectorId?: string;
};

type SignInSmsLogPayload = ArbitraryLogPayload & {
  phone?: string;
  code?: string;
  userId?: string;
};

type SignInSocialBindLogPayload = ArbitraryLogPayload & {
  connectorId?: string;
  userInfo?: object;
  userId?: string;
};

type SignInSocialLogPayload = SignInSocialBindLogPayload & {
  code?: string;
  state?: string;
  redirectUri?: string;
  redirectTo?: string;
};

type ForgotPasswordSmsSendPasscodeLogPayload = ArbitraryLogPayload & {
  phone?: string;
  connectorId?: string;
};

type ForgotPasswordSmsLogPayload = ArbitraryLogPayload & {
  phone?: string;
  code?: string;
  userId?: string;
};

type ForgotPasswordEmailSendPasscodeLogPayload = ArbitraryLogPayload & {
  email?: string;
  connectorId?: string;
};

type ForgotPasswordEmailLogPayload = ArbitraryLogPayload & {
  email?: string;
  code?: string;
  userId?: string;
};

type ForgotPasswordResetLogPayload = ArbitraryLogPayload & {
  userId?: string;
};

export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  IdToken = 'IdToken',
}

type ExchangeTokenLogPayload = ArbitraryLogPayload & {
  userId?: string;
  params?: Record<string, unknown>;
  issued?: TokenType[];
  scope?: string;
};

type RevokeTokenLogPayload = ArbitraryLogPayload & {
  userId?: string;
  params?: Record<string, unknown>;
  grantId?: string;
  tokenType?: TokenType;
};

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
  ForgotPasswordSmsSendPasscode: ForgotPasswordSmsSendPasscodeLogPayload;
  ForgotPasswordSms: ForgotPasswordSmsLogPayload;
  ForgotPasswordEmailSendPasscode: ForgotPasswordEmailSendPasscodeLogPayload;
  ForgotPasswordEmail: ForgotPasswordEmailLogPayload;
  ForgotPasswordReset: ForgotPasswordResetLogPayload;
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
