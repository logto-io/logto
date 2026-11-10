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

/** Max bytes per encoded-word: `=?UTF-8?B?` + base64 + `?=` must stay within 75 characters. */
const maxEncodedWordBytes = 45;

/** RFC 2047 encoded-words for `name`, split at UTF-8 character boundaries, joined by spaces. */
const encodeDisplayName = (name: string): string => {
  const chunks = [...name].reduce<string[]>((accumulator, character) => {
    const last = accumulator.at(-1);

    return last !== undefined && Buffer.byteLength(last + character, 'utf8') <= maxEncodedWordBytes
      ? [...accumulator.slice(0, -1), last + character]
      : [...accumulator, character];
  }, []);

  return chunks
    .map((chunk) => `=?UTF-8?B?${Buffer.from(chunk, 'utf8').toString('base64')}?=`)
    .join(' ');
};

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
    return `${encodeDisplayName(name)} <${email}>`;
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

  const renderedReplyTo =
    replyTo && payload ? replaceSendMessageHandlebars(replyTo, payload).trim() : '';
  // An unresolved placeholder (e.g. `{{user.primaryEmail}}` without a user) is not an address.
  const replyToAddress = emailGuard.safeParse(renderedReplyTo).success
    ? renderedReplyTo
    : undefined;

  return new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Content: emailContent,
    FromEmailAddress: getFromEmailAddress(config.emailAddress, sendFrom, payload),
    // SES rejects an empty reply-to address, so skip it unless the template renders to a valid address.
    ...(replyToAddress && { ReplyToAddresses: [replyToAddress] }),
    FromEmailAddressIdentityArn: config.emailAddressIdentityArn,
    FeedbackForwardingEmailAddress: config.feedbackForwardingEmailAddress,
    FeedbackForwardingEmailAddressIdentityArn: config.feedbackForwardingEmailAddressIdentityArn,
    ConfigurationSetName: config.configurationSetName,
  });
};
