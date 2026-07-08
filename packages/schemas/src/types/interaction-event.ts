import { z } from 'zod';

/**
 * User interaction events defined in Logto RFC 0004.
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information.
 */
export enum InteractionEvent {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
}

export const eventGuard = z.nativeEnum(InteractionEvent);
