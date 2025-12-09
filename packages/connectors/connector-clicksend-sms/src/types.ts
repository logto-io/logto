import type { Nullable } from '@silverhand/essentials';
import { z } from 'zod';

/**
 * @doc https://developers.clicksend.com/docs/rest/v3/#send-sms
 */

export type ClicksendSmsMessage = {
  to: string;
  from?: string;
  body: string;
  source?: string;
  schedule?: number;
  custom_string?: string;
};

export type ClicksendSmsRequest = {
  messages: ClicksendSmsMessage[];
};

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic', etc.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const clicksendSmsConfigGuard = z.object({
  username: z.string(),
  apiKey: z.string(),
  from: z.string().optional(),
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

export type ClicksendSmsConfig = z.infer<typeof clicksendSmsConfigGuard>;

export type ClicksendSmsResponse = {
  http_code: number;
  response_code: string;
  response_msg: string;
  data: {
    total_price: number;
    total_count: number;
    queued_count: number;
    messages: Array<{
      direction: string;
      date: number;
      to: string;
      body: string;
      from: string;
      schedule: number;
      message_id: string;
      message_parts: number;
      message_price: string;
      custom_string: string;
      user_id: number;
      subaccount_id: number;
    }>;
    _currency: {
      currency_name_short: string;
      currency_prefix_d: string;
      currency_prefix_c: string;
      currency_name_long: string;
    };
  };
};

export type ClicksendSmsErrorResponse = {
  http_code: number;
  response_code: string;
  response_msg: string;
  data?: Nullable<unknown>;
};

