// MARK: SMS + Email connector

import { z } from 'zod';

import { type BaseConnector, type ConnectorType } from './foundation.js';

/** @deprecated Use {@link TemplateType} instead. */
export enum VerificationCodeType {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
  Generic = 'Generic',
  UserPermissionValidation = 'UserPermissionValidation',
  BindNewIdentifier = 'BindNewIdentifier',
  /** @deprecated Use `Generic` type template for sending test sms/email use case */
  Test = 'Test',
}

/** @deprecated Use {@link templateTypeGuard} instead. */
export const verificationCodeTypeGuard = z.nativeEnum(VerificationCodeType);

export enum TemplateType {
  /** The template for sending verification code when user is signing in. */
  SignIn = 'SignIn',
  /** The template for sending verification code when user is registering. */
  Register = 'Register',
  /** The template for sending verification code when user is resetting password. */
  ForgotPassword = 'ForgotPassword',
  /** The template for sending organization invitation. */
  OrganizationInvitation = 'OrganizationInvitation',
  /** The template for generic usage. */
  Generic = 'Generic',
  /** The template for validating user permission for sensitive operations. */
  UserPermissionValidation = 'UserPermissionValidation',
  /** The template for binding a new identifier to an existing account. */
  BindNewIdentifier = 'BindNewIdentifier',
  /** The template for sending MFA verification code. */
  MfaVerification = 'MfaVerification',
  /** The template for binding MFA verification. */
  BindMfa = 'BindMfa',
}

export const templateTypeGuard = z.nativeEnum(TemplateType);

/** The payload for sending email or sms. */
export type SendMessagePayload = {
  /**
   * The dynamic verification code to send. It will replace the `{{code}}` handlebars in the
   * template.
   * @example '123456'
   */
  code?: string;
  /**
   * The dynamic link to send. It will replace the `{{link}}` handlebars in the template.
   * @example 'https://example.com'
   */
  link?: string;
  /**
   * The language tag detected from the user's request. It will be used to localize the message.
   * If provided, Logto will use the corresponding language template to send the message.
   * If not provided, or the language template is not available, will fallback to the default language and template.
   *
   * @remarks
   * For email connectors that handle email templates at the provider side, use this field to indicate the user's preferred language.
   *
   * @example 'en-US'
   */
  locale?: string;
  /**
   * The `ui_locales` parameter from the authentication request, which can be used to localize the message.
   * This is different from `locale` as it is the original request parameter and may contain multiple language
   * tags sorted by user's preference.
   * The `locale` field, is the single language tag resolved from multiple sources, and the precedence is:
   * `ui_locales` > HTTP `Accept-Language` header > default fallback (en).
   *
   * @remarks
   * For email connectors that handle email templates at the provider side, use this field to indicate the user's preferred language.
   *
   * @example 'en-US en'
   */
  uiLocales?: string;
} & Record<string, unknown>;

/** The guard for {@link SendMessagePayload}. */
export const sendMessagePayloadGuard = z
  .object({
    code: z.string().optional(),
    link: z.string().optional(),
    locale: z.string().optional(),
    uiLocales: z.string().optional(),
  })
  .catchall(z.unknown()) satisfies z.ZodType<SendMessagePayload>;

export const urlRegEx =
  /(https?:\/\/)?(?:www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b[\w#%&()+./:=?@~-]*/;

export const emailServiceBrandingGuard = z
  .object({
    senderName: z
      .string()
      .refine((address) => !urlRegEx.test(address), 'URL is not allowed in sender name.'),
    companyInformation: z
      .string()
      .refine((address) => !urlRegEx.test(address), 'URL is not allowed in company information.'),
    appLogo: z.string().url(),
  })
  .partial();

export type EmailServiceBranding = z.infer<typeof emailServiceBrandingGuard>;

export type SendMessageData = {
  to: string;
  type: TemplateType;
  payload: SendMessagePayload;
  /**
   * The client IP address of the user who triggered the message.
   * This can be used by connectors for rate limiting, fraud detection, or logging purposes.
   * @example '192.168.1.1'
   */
  ip?: string;
};

export const sendMessageDataGuard = z.object({
  to: z.string(),
  type: templateTypeGuard,
  payload: sendMessagePayloadGuard,
  ip: z.string().optional(),
}) satisfies z.ZodType<SendMessageData>;

export type SendMessageFunction = (data: SendMessageData, config?: unknown) => Promise<unknown>;

export type GetUsageFunction = (startFrom?: Date) => Promise<number>;

export type SmsConnector = BaseConnector<ConnectorType.Sms> & {
  sendMessage: SendMessageFunction;
  getUsage?: GetUsageFunction;
};

export type EmailConnector = BaseConnector<ConnectorType.Email> & {
  sendMessage: SendMessageFunction;
  getUsage?: GetUsageFunction;
};
