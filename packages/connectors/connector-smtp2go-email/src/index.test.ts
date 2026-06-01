import nock from 'nock';

import { ConnectorErrorCodes, TemplateType } from '@logto/connector-kit';
import * as connectorKit from '@logto/connector-kit';

import createConnector from './index.js';
import type { Smtp2goEmailConfig } from './types.js';
import { ContentType } from './types.js';

const getConfig = vi.fn();
// eslint-disable-next-line unicorn/no-useless-undefined
const getI18nEmailTemplate = vi.fn().mockResolvedValue(undefined);

const connector = await createConnector({ getConfig, getI18nEmailTemplate });

const sender = 'noreply@example.com';
const toEmail = 'test@example.com';

const mockedConfig: Smtp2goEmailConfig = {
  apiKey: 'test-api-key-123',
  sender,
  senderName: 'Logto Test',
  templates: [
    {
      usageType: 'SignIn',
      type: ContentType.Text,
      subject: 'Sign-In Code',
      content: 'Your code is {{code}}',
    },
    {
      usageType: 'Register',
      type: ContentType.Text,
      subject: 'Registration Code',
      content: 'Your code is {{code}}',
    },
    {
      usageType: 'ForgotPassword',
      type: ContentType.Text,
      subject: 'Password Reset Code',
      content: 'Your code is {{code}}',
    },
    {
      usageType: 'Generic',
      type: ContentType.Text,
      subject: 'Verification Code',
      content: 'Your code is {{code}}',
    },
  ],
};

const nockMessages = (expectation: Record<string, unknown>, endpoint = 'https://api.smtp2go.com') =>
  nock(endpoint)
    .post('/v3/email/send')
    .reply((_, body, callback) => {
      expect(body).toMatchObject(expectation);
      callback(null, [200, { data: { succeeded: 1, failed: 0 } }]);
    });

describe('SMTP2GO Email connector', () => {
  beforeEach(() => {
    nock.cleanAll();
    getI18nEmailTemplate.mockReset();
    // eslint-disable-next-line unicorn/no-useless-undefined
    getI18nEmailTemplate.mockResolvedValue(undefined);
  });

  it('should send generic email with default config', async () => {
    nockMessages({
      api_key: mockedConfig.apiKey,
      to: [toEmail],
      sender: `${mockedConfig.senderName} <${sender}>`,
      subject: 'Verification Code',
      text_body: 'Your code is 123456',
    });

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: { code: '123456' },
    });
  });

  it('should send email with custom i18n template', async () => {
    getI18nEmailTemplate.mockResolvedValue({
      subject: 'Custom Passcode {{code}}',
      content: '<p>Your passcode is {{code}}</p>',
      contentType: 'text/html',
      sendFrom: '{{application.name}}',
    });

    nockMessages({
      api_key: mockedConfig.apiKey,
      to: [toEmail],
      sender: 'Test App <noreply@example.com>',
      subject: 'Custom Passcode 123456',
      html_body: '<p>Your passcode is 123456</p>',
    });

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: {
        code: '123456',
        application: { name: 'Test App' },
      },
    });
  });

  it('should allow sendFrom to override email address when formatted as mailbox', async () => {
    getI18nEmailTemplate.mockResolvedValue({
      subject: 'Mailbox {{code}}',
      content: 'Your code is {{code}}',
      contentType: 'text/plain',
      sendFrom: 'Support <support@example.com>',
    });

    nockMessages({
      api_key: mockedConfig.apiKey,
      to: [toEmail],
      sender: 'Support <support@example.com>',
      subject: 'Mailbox 123456',
      text_body: 'Your code is 123456',
    });

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: { code: '123456' },
    });
  });

  it('should send email with replyTo custom header from i18n template', async () => {
    getI18nEmailTemplate.mockResolvedValue({
      subject: 'Custom Passcode {{code}}',
      content: 'Your passcode is {{code}}',
      contentType: 'text/plain',
      replyTo: 'Reply to {{user.primaryEmail}}',
    });

    nockMessages({
      api_key: mockedConfig.apiKey,
      to: [toEmail],
      sender: `${mockedConfig.senderName} <${sender}>`,
      subject: 'Custom Passcode 123456',
      text_body: 'Your passcode is 123456',
      custom_headers: [{ header: 'Reply-To', value: 'Reply to user@example.com' }],
    });

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: {
        code: '123456',
        user: { primaryEmail: 'user@example.com' },
      },
    });
  });

  it('should throw TemplateNotFound when no template is available', async () => {
    vi.spyOn(connectorKit, 'getConfigTemplateByType').mockReturnValue(
      // eslint-disable-next-line unicorn/no-useless-undefined
      undefined
    );
    getConfig.mockResolvedValue(mockedConfig);

    await expect(
      connector.sendMessage({
        to: toEmail,
        type: TemplateType.OrganizationInvitation,
        payload: { link: 'https://example.com' },
      })
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.TemplateNotFound });

    vi.restoreAllMocks();
  });
});
