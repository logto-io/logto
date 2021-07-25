export enum SignInErrorCode {
  InvalidCredentials = 'sign_in.invalid_credentials',
  InvalidSignInMethod = 'sign_in.invalid_sign_in_method',
  InsufficientInfo = 'sign_in.insufficient_info',
}

export const signInErrorMessage: Record<SignInErrorCode, string> = {
  [SignInErrorCode.InvalidCredentials]: 'Invalid credentials. Please check your input.',
  [SignInErrorCode.InvalidSignInMethod]: 'Current sign-in method is not available.',
  [SignInErrorCode.InsufficientInfo]: 'Insufficent sign-in info.',
};
