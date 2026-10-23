import type {
  SignInIdentifier,
  Theme,
  WebAuthnRegistrationOptions,
  WebAuthnAuthenticationOptions,
  InteractionEvent,
} from '@logto/schemas';

import type { SignInExperienceResponse, Platform } from '../shared/types';

export type { SignInExperienceResponse, Platform } from '../shared/types';

export enum UserFlow {
  SignIn = 'sign-in',
  Register = 'register',
  ForgotPassword = 'forgot-password',
  Continue = 'continue',
}

export enum UserMfaFlow {
  MfaBinding = 'mfa-binding',
  MfaVerification = 'mfa-verification',
}

export enum SearchParameters {
  NativeCallbackLink = 'native_callback',
  RedirectTo = 'redirect_to',
  LinkSocial = 'link_social',
  /**
   * Internal marker for the wallet sign-in callback. The signature has already been verified
   * before the browser navigates to the social callback page, so the page must not verify it
   * again with a consumed connector session.
   */
  SiweCallback = 'siwe_callback',
}

export type VerificationCodeIdentifier = SignInIdentifier.Email | SignInIdentifier.Phone;

export type PreviewConfig = {
  signInExperience: SignInExperienceResponse;
  language: string;
  mode: Theme;
  platform: Platform;
  isNative: boolean;
};

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type WebAuthnOptions = WebAuthnRegistrationOptions | WebAuthnAuthenticationOptions;

export type ContinueFlowInteractionEvent = InteractionEvent.Register | InteractionEvent.SignIn;
