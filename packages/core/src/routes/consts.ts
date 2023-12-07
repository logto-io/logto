const signIn = '/sign-in';
const signUp = '/register';
const consent = '/consent';

export const routes = Object.freeze({
  signIn,
  signUp,
  consent,
} as const);

export const verificationTimeout = 10 * 60 * 1000; // 10 mins.
