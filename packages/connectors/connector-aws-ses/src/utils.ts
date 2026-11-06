import type { EmailContent } from '@aws-sdk/client-sesv2';
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import type { AwsCredentialIdentity } from '@aws-sdk/types';
import {
  type EmailTemplateDetails,
  replaceSendMessageHandlebars,
  type SendMessagePayload,
} from '@logto/connector-kit';

import type { AwsSesConfig, Template } from './types.js';

export const makeClient = (
  accessKeyId: string,
  secretAccessKey: string,
  region: string
): SESv2Client => {
  const credentials: AwsCredentialIdentity = {
    accessKeyId,
    secretAccessKey,
  };

  return new SESv2Client({ credentials, region });
};

export const makeEmailContent = (
  template: Template | EmailTemplateDetails,
  payload: SendMessagePayload
): EmailContent => {
  return {
    Simple: {
      Subject: { Data: replaceSendMessageHandlebars(template.subject, payload), Charset: 'utf8' },
      Body: {
        Html: {
          Data: replaceSendMessageHandlebars(template.content, payload),
        },
      },
    },
  };
};

/**
 * `sendFrom` of the i18n email template is either a full address, which is used as is, or just a
 * display name, which is combined with the configured address (SES rejects a bare name).
 */
const getFromEmailAddress = (
  emailAddress?: string,
  sendFrom?: string,
  payload?: SendMessagePayload
): string | undefined => {
  const resolved = sendFrom && payload ? replaceSendMessageHandlebars(sendFrom, payload) : '';

  if (!resolved) {
    return emailAddress;
  }

  if (resolved.includes('@')) {
    return resolved;
  }

  // A bare display name needs a configured address to be combined with. The configured address may
  // already carry its own display name (`Logto<noreply@logto.io>`), so only its bare address is used.
  const bareAddress = emailAddress?.match(/<([^>]*)>/)?.[1]?.trim() ?? emailAddress;

  return bareAddress && `${resolved} <${bareAddress}>`;
};

export const makeCommand = (
  config: AwsSesConfig,
  emailContent: EmailContent,
  to: string,
  {
    template,
    payload,
  }: { template?: Template | EmailTemplateDetails; payload?: SendMessagePayload } = {}
): SendEmailCommand => {
  // The i18n email template may customize the sender and the reply-to address.
  const sendFrom = template && 'sendFrom' in template ? template.sendFrom : undefined;
  const replyTo = template && 'replyTo' in template ? template.replyTo : undefined;

  const replyToAddress = replyTo && payload ? replaceSendMessageHandlebars(replyTo, payload) : '';

  return new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Content: emailContent,
    FromEmailAddress: getFromEmailAddress(config.emailAddress, sendFrom, payload),
    // SES rejects an empty reply-to address, so skip it when the template renders to nothing.
    ...(replyToAddress && { ReplyToAddresses: [replyToAddress] }),
    FromEmailAddressIdentityArn: config.emailAddressIdentityArn,
    FeedbackForwardingEmailAddress: config.feedbackForwardingEmailAddress,
    FeedbackForwardingEmailAddressIdentityArn: config.feedbackForwardingEmailAddressIdentityArn,
    ConfigurationSetName: config.configurationSetName,
  });
};
