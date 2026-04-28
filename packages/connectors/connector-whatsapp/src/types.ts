import { z } from 'zod';

/**
 * WhatsApp Cloud API - Send Message
 * @doc https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
 * @doc https://developers.facebook.com/docs/whatsapp/cloud-api/messages/message-templates
 */

/**
 * Parameters sent to the WhatsApp Cloud API.
 * We use template messages so the OTP code is passed as a template component parameter.
 */
export type WhatsAppMessagePayload = {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components: Array<
      | {
          type: 'body';
          parameters: Array<{
            type: 'text';
            text: string;
          }>;
        }
      | {
          type: 'button';
          sub_type: 'url';
          index: '0';
          parameters: Array<{
            type: 'text';
            text: string;
          }>;
        }
    >;
  };
};

/**
 * UsageType here maps to a specific approved WhatsApp template name.
 * Each usageType must have a corresponding approved template in Meta Business Manager.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  templateName: z.string(),
  language: z.string().default('en'),
});

export const whatsappSmsConfigGuard = z.object({
  accessToken: z.string(),
  phoneNumberId: z.string(),
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

export type WhatsAppSmsConfig = z.infer<typeof whatsappSmsConfigGuard>;

/**
 * Successful response from WhatsApp Cloud API
 */
export type WhatsAppSendResponse = {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
    message_status?: string;
  }>;
};

/**
 * Error response from WhatsApp Cloud API
 */
export const whatsappErrorResponseGuard = z.object({
  error: z.object({
    message: z.string(),
    type: z.string().optional(),
    code: z.number().optional(),
    fbtrace_id: z.string().optional(),
  }),
});

export type WhatsAppErrorResponse = z.infer<typeof whatsappErrorResponseGuard>;
