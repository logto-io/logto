// MARK: SMS + Email connector

import { z } from 'zod';

import { type BaseConnector, type ConnectorType } from './foundation.js';

export enum VerificationCodeType {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
  Generic = 'Generic',
  /** @deprecated Use `Generic` type template for sending test sms/email use case */
  Test = 'Test',
}

export const verificationCodeTypeGuard = z.nativeEnum(VerificationCodeType);

export type SendMessagePayload = {
  /**
   * The dynamic verification code to send.
   * @example '123456'
   */
  code: string;
};

export const sendMessagePayloadGuard = z.object({
  code: z.string(),
}) satisfies z.ZodType<SendMessagePayload>;

export const urlRegEx =
  /(https?:\/\/)?(?:www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b[\w#%&()+./:=?@~-]*/;

export const emailServiceBrandingGuard = z
  .object({
    senderName: z
      .string()
      .refine((address) => !urlRegEx.test(address), 'DO NOT include URL in the sender name!'),
    companyInformation: z
      .string()
      .refine(
        (address) => !urlRegEx.test(address),
        'DO NOT include URL in the company information!'
      ),
    appLogo: z.string().url(),
  })
  .partial();

export type EmailServiceBranding = z.infer<typeof emailServiceBrandingGuard>;

export type SendMessageData = {
  to: string;
  type: VerificationCodeType;
  payload: SendMessagePayload;
};

export const sendMessageDataGuard = z.object({
  to: z.string(),
  type: verificationCodeTypeGuard,
  payload: sendMessagePayloadGuard,
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
