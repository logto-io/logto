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

export const makeCommand = (
  config: AwsSesConfig,
  emailContent: EmailContent,
  to: string,
  template?: Template | EmailTemplateDetails,
  payload?: SendMessagePayload
): SendEmailCommand => {
  // The i18n email template may customize the sender and the reply-to address.
  const sendFrom = template && 'sendFrom' in template ? template.sendFrom : undefined;
  const replyTo = template && 'replyTo' in template ? template.replyTo : undefined;

  return new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Content: emailContent,
    FromEmailAddress:
      sendFrom && payload ? replaceSendMessageHandlebars(sendFrom, payload) : config.emailAddress,
    ...(replyTo &&
      payload && {
        ReplyToAddresses: [replaceSendMessageHandlebars(replyTo, payload)],
      }),
    FromEmailAddressIdentityArn: config.emailAddressIdentityArn,
    FeedbackForwardingEmailAddress: config.feedbackForwardingEmailAddress,
    FeedbackForwardingEmailAddressIdentityArn: config.feedbackForwardingEmailAddressIdentityArn,
    ConfigurationSetName: config.configurationSetName,
  });
};
