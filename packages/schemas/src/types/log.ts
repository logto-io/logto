export enum LogType {
  RegisterUsernamePassword = 'RegisterUsernamePassword',
  RegisterEmail = 'RegisterEmail',
  RegisterEmailSendPasscode = 'RegisterEmailSendPasscode',
  RegisterSms = 'RegisterSms',
  RegisterSmsSendPasscode = 'RegisterSmsSendPasscode',
  RegisterSocial = 'RegisterSocial',
  RegisterSocialBind = 'RegisterSocialBind',
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
