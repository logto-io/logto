const routes = Object.freeze({
  signIn: 'sign-in',
  register: 'register',
  sso: 'single-sign-on',
  consent: 'consent',
  resetPassword: 'reset-password',
  identifierSignIn: 'identifier-sign-in',
  identifierRegister: 'identifier-register',
  switchAccount: 'switch-account',
  oneTimeToken: 'one-time-token',
} as const);

export const experience = Object.freeze({
  routes,
} as const);
