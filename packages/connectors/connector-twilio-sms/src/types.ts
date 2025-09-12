import type { Nullable } from '@silverhand/essentials';
import { z } from 'zod';

/**
 * @doc https://www.twilio.com/docs/sms/send-messages
 *
 * @doc https://www.twilio.com/docs/phone-numbers
 * @doc https://www.twilio.com/phone-numbers/global-catalog
 * @doc https://en.wikipedia.org/wiki/E.164
 */

export type PublicParameters = {
  To: string;
  MessagingServiceSid: string;
  Body: string;
  RiskCheck?: 'enable' | 'disable';
};

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const twilioSmsConfigGuard = z.object({
  accountSID: z.string(),
  authToken: z.string(),
  fromMessagingServiceSID: z.string(),
  disableRiskCheck: z.boolean().optional(),
  templates: z.array(templateGuard).refine(
    (templates) =>
      requiredTemplateUsageTypes.every((requiredType) =>
        templates.map((template) => template.usageType).includes(requiredType)
      ),
    (templates) => ({
      message: `Template with UsageType (${requiredTemplateUsageTypes
        .filter(
          (requiredType) => !templates.map((template) => template.usageType).includes(requiredType)
        )
        .join(', ')}) should be provided!`,
    })
  ),
});

export type TwilioSmsConfig = z.infer<typeof twilioSmsConfigGuard>;

export type SendSmsResponse = {
  account_sid: string;
  api_version: string;
  body: string;
  code: number;
  date_cereated: Nullable<string>;
  date_sent: Nullable<string>;
  date_updated: Nullable<string>;
  direction: string;
  error_code: Nullable<string>;
  error_message: Nullable<string>;
  from: Nullable<string>;
  message: Nullable<string>;
  messaging_service_sid: string;
  more_info: Nullable<string>;
  num_media: string;
  num_segments: string;
  price: Nullable<string>;
  price_unit: Nullable<string>;
  sid: string;
  status: number;
  subresource_uris: {
    media?: string;
    feedback?: string;
  };
  to: string;
  uri: string;
};

// See https://www.twilio.com/docs/usage/twilios-response
export const sendSmsErrorResponseGuard = z.object({
  status: z.number(),
  message: z.string(),
  code: z.number().optional(),
  more_info: z.string().optional(),
});

export type SendSmsErrorResponse = z.infer<typeof sendSmsErrorResponseGuard>;
