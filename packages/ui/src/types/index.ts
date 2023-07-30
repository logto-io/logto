import type { SignInExperience, SignInIdentifier, Theme } from '@logto/schemas';

import { type ConnectorMetadataWithId } from '@/containers/ConnectorSignInList';

export enum UserFlow {
  SignIn = 'sign-in',
  Register = 'register',
  ForgotPassword = 'forgot-password',
  Continue = 'continue',
}

export enum SearchParameters {
  NativeCallbackLink = 'native_callback',
  RedirectTo = 'redirect_to',
  LinkSocial = 'link_social',
}

export type Platform = 'web' | 'mobile';

export type VerificationCodeIdentifier = SignInIdentifier.Email | SignInIdentifier.Phone;

// Omit signInConnectorTargets since it is being translated into connectors
export type SignInExperienceResponse = Omit<SignInExperience, 'signInConnectorTargets'> & {
  connectors: ConnectorMetadataWithId[];
  notification?: string;
  forgotPassword: {
    phone: boolean;
    email: boolean;
  };
};

export type PreviewConfig = {
  signInExperience: SignInExperienceResponse;
  language: string;
  mode: Theme;
  platform: Platform;
  isNative: boolean;
};

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;
