import type { SignInExperience, ConnectorMetadata, SignInIdentifier, Theme } from '@logto/schemas';

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
}

export type Platform = 'web' | 'mobile';

export type VerificationCodeIdentifier = SignInIdentifier.Email | SignInIdentifier.Phone;

// Omit socialSignInConnectorTargets since it is being translated into socialConnectors
export type SignInExperienceResponse = Omit<SignInExperience, 'socialSignInConnectorTargets'> & {
  socialConnectors: ConnectorMetadata[];
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
