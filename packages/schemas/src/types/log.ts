import { Passcode } from '../db-entries';

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

export interface BaseLogPayload {
  result?: LogResult;
  error?: string;
  ip?: string;
  userAgent?: string;
}

interface CommonFields {
  sessionId?: string;
}

interface RegisterUsernamePasswordLogPayload extends CommonFields {
  userId?: string;
  username?: string;
}

interface RegisterEmailSendPasscodeLogPayload extends CommonFields {
  email?: string;
  passcode?: Passcode;
}

interface RegisterEmailLogPayload extends CommonFields {
  email?: string;
  code?: string;
  userId?: string;
}

interface RegisterSmsSendPasscodeLogPayload extends CommonFields {
  phone?: string;
  passcode?: Passcode;
}

interface RegisterSmsLogPayload extends CommonFields {
  phone?: string;
  code?: string;
  userId?: string;
}

interface RegisterSocialBindLogPayload extends CommonFields {
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

interface SignInUsernamePasswordLogPayload extends CommonFields {
  userId?: string;
  username?: string;
}

interface SignInEmailSendPasscodeLogPayload extends CommonFields {
  email?: string;
  passcode?: Passcode;
}

interface SignInEmailLogPayload extends CommonFields {
  email?: string;
  code?: string;
  userId?: string;
}

interface SignInSmsSendPasscodeLogPayload extends CommonFields {
  phone?: string;
  passcode?: Passcode;
}

interface SignInSmsLogPayload extends CommonFields {
  phone?: string;
  code?: string;
  userId?: string;
}

interface SignInSocialBindLogPayload extends CommonFields {
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
};

export type LogType = keyof LogPayloads;

export type LogPayload = LogPayloads[LogType];
