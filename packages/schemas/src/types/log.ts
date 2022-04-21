export enum LogType {
  SignInUsernamePassword = 'SignInUsernamePassword',
  SignInEmail = 'SignInEmail',
  SignInEmailSendPasscode = 'SignInEmailSendPasscode',
  SignInSms = 'SignInSms',
  SignInSmsSendPasscode = 'SignInSmsSendPasscode',
  SignInSocial = 'SignInSocial',
  SignInSocialBind = 'SignInSocialBind',
}

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}
