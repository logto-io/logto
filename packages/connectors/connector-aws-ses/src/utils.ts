import type { EmailContent } from '@aws-sdk/client-sesv2';
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import type { AwsCredentialIdentity } from '@aws-sdk/types';

import type { AwsSesConfig, Template, Payload } from './types.js';

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

export const makeEmailContent = (template: Template, payload: Payload): EmailContent => {
  return {
    Simple: {
      Subject: { Data: template.subject, Charset: 'utf8' },
      Body: {
        Html: {
          Data:
            typeof payload.code === 'string'
              ? template.content.replace(/{{code}}/g, payload.code)
              : template.content,
        },
      },
    },
  };
};

export const makeCommand = (
  config: AwsSesConfig,
  emailContent: EmailContent,
  to: string
): SendEmailCommand => {
  return new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Content: emailContent,
    FromEmailAddress: config.emailAddress,
    FromEmailAddressIdentityArn: config.emailAddressIdentityArn,
    FeedbackForwardingEmailAddress: config.feedbackForwardingEmailAddress,
    FeedbackForwardingEmailAddressIdentityArn: config.feedbackForwardingEmailAddressIdentityArn,
    ConfigurationSetName: config.configurationSetName,
  });
};
