const signIn = '/sign-in';

export const routes = Object.freeze({
  signIn: {
    credentials: signIn,
    consent: `${signIn}/consent`,
  },
} as const);

export const verificationTimeout = 10 * 60; // 10 mins.
export const continueSignInTimeout = 10 * 60; // 10 mins.
