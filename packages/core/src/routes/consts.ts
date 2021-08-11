import { signIn } from '@/env/consts';

export const routes = Object.freeze({
  signIn: {
    credentials: signIn,
    consent: signIn + '/consent',
  },
});
