import { assertEnv } from '@/utils/env';

const signIn = assertEnv('UI_SIGN_IN_ROUTE');

export const routes = Object.freeze({
  signIn: {
    credentials: signIn,
    consent: signIn + '/consent',
  },
});
