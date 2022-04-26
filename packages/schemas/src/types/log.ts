import { Passcode } from '../db-entries';

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

interface BaseLogPayload {
  sessionId?: string;
  result?: LogResult;
  error?: string;
}

interface SignInUsernamePasswordLogPayload extends BaseLogPayload {
  userId?: string;
  username?: string;
}

interface SignInEmailSendPasscodeLogPayload extends BaseLogPayload {
  email?: string;
  passcode?: Passcode;
}

interface SignInEmailLogPayload extends BaseLogPayload {
  email?: string;
  code?: string;
  userId?: string;
}

interface SignInSmsSendPasscodeLogPayload extends BaseLogPayload {
  phone?: string;
  passcode?: Passcode;
}

interface SignInSmsLogPayload extends BaseLogPayload {
  phone?: string;
  code?: string;
  userId?: string;
}

interface SignInSocialBindLogPayload extends BaseLogPayload {
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
