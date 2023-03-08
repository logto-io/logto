const signIn = '/sign-in';
const signUp = '/register';

export const routes = Object.freeze({
  signIn: {
    credentials: signIn,
    consent: `${signIn}/consent`,
  },
  signUp,
} as const);

export const verificationTimeout = 10 * 60 * 1000; // 10 mins.
