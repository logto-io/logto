export const forgotPasswordReAuthenticationTimeout = 10 * 60; // 10 mins.

export enum ReAuthenticationTypeEnum {
  ForgotPassword = 'ForgotPassword',
}
export type ReAuthenticationType = keyof typeof ReAuthenticationTypeEnum; // "Profile fulfilling" also need re-authentication in near future.
