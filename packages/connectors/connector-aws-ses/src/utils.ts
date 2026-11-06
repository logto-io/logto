import { z } from 'zod';

import type { EmailContent } from '@aws-sdk/client-sesv2';
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import type { AwsCredentialIdentity } from '@aws-sdk/types';
import {
  type EmailTemplateDetails,
  parseSendFrom,
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

const emailGuard = z.string().email();

/** `parseSendFrom` keeps the quotes of `"Name" <addr>`; strip them and undo the escapes. */
const unquote = (name: string): string =>
  name.length > 1 && name.startsWith('"') && name.endsWith('"')
    ? name.slice(1, -1).replaceAll(/\\(.)/g, '$1')
    : name;

/**
 * Format a mailbox for the SES `FromEmailAddress`: a name with non-ASCII characters is sent as an
 * RFC 2047 encoded-word, and a name with RFC 5322 specials (`,`, `(`, `"`, ...) is quoted.
 */
const formatSesMailbox = (email: string, name?: string): string => {
  if (!name) {
    return email;
  }

  // eslint-disable-next-line no-control-regex
  const isAscii = /^[\u0000-\u007F]*$/.test(name);

  if (!isAscii) {
    return `=?UTF-8?B?${Buffer.from(name, 'utf8').toString('base64')}?= <${email}>`;
  }

  const isPlainWords = /^[\w!#$%&'*+/=?^`{|}~-]+(?: [\w!#$%&'*+/=?^`{|}~-]+)*$/.test(name);
  const displayName = isPlainWords
    ? name
    : `"${name.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;

  return `${displayName} <${email}>`;
};

/**
 * `sendFrom` of the i18n email template is either a full mailbox (`Name <addr>` or `addr`), or just
 * a display name, which is combined with the configured address (SES rejects a bare name).
 */
const getFromEmailAddress = (
  emailAddress?: string,
  sendFrom?: string,
  payload?: SendMessagePayload
): string | undefined => {
  const resolved = sendFrom && payload ? replaceSendMessageHandlebars(sendFrom, payload) : '';

  if (!resolved.trim()) {
    return emailAddress;
  }

  // The configured address may carry its own display name (`Logto<noreply@logto.io>`).
  const configured = emailAddress ? parseSendFrom(emailAddress, emailAddress) : undefined;
  const { email, name } = parseSendFrom(resolved, configured?.email ?? '');

  // The configured address is trusted as is; an address taken from the template must be valid.
  if (email !== configured?.email && !emailGuard.safeParse(email).success) {
    return emailAddress;
  }

  return formatSesMailbox(email, name && unquote(name));
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
