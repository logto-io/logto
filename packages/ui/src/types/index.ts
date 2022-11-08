import type {
  SignInExperience,
  ConnectorMetadata,
  AppearanceMode,
  SignInIdentifier,
} from '@logto/schemas';

export enum UserFlow {
  signIn = 'sign-in',
  register = 'register',
  forgotPassword = 'forgot-password',
  continue = 'continue',
}

export enum SearchParameters {
  bindWithSocial = 'bind_with',
  nativeCallbackLink = 'native_callback',
  redirectTo = 'redirect_to',
}

export type Platform = 'web' | 'mobile';

// TODO: @simeng, @sijie, @charles should we combine this with admin console?
export type Theme = 'dark' | 'light';

// Omit signInMethods property since it is deprecated,
// Omit socialSignInConnectorTargets since it is being translated into socialConnectors
export type SignInExperienceResponse = Omit<
  SignInExperience,
  'signInMethods' | 'socialSignInConnectorTargets'
> & {
  socialConnectors: ConnectorMetadata[];
  notification?: string;
  forgotPassword: {
    sms: boolean;
    email: boolean;
  };
};

export type SignInExperienceSettings = Omit<SignInExperienceResponse, 'signUp'> & {
  signUp: Omit<SignInExperienceResponse['signUp'], 'identifier'> & {
    methods: SignInIdentifier[];
  };
};

export enum ConfirmModalMessage {
  SHOW_TERMS_DETAIL_MODAL = 'SHOW_TERMS_DETAIL_MODAL',
}

export type PreviewConfig = {
  signInExperience: SignInExperienceResponse;
  language: string;
  mode: AppearanceMode.LightMode | AppearanceMode.DarkMode;
  platform: Platform;
  isNative: boolean;
};

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;
