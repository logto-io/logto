import { SESv2Client } from '@aws-sdk/client-sesv2';
import { TemplateType } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig, mockGenericI18nEmailTemplate } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

const getI18nEmailTemplate = vi.fn().mockResolvedValue(mockGenericI18nEmailTemplate);

vi.spyOn(SESv2Client.prototype, 'send').mockResolvedValue({
  MessageId: 'mocked-message-id',
  $metadata: {
    httpStatusCode: 200,
  },
} as never);

describe('sendMessage()', () => {
  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should call SendMail() with correct template and content', async () => {
    const connector = await createConnector({ getConfig });
    const toMail = 'to@email.com';
    const { emailAddress } = mockedConfig;
    await connector.sendMessage({
      to: toMail,
      type: TemplateType.SignIn,
      payload: { code: '1234' },
    });
    const toExpected = [toMail];
    expect(SESv2Client.prototype.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          FromEmailAddress: emailAddress,
          Destination: { ToAddresses: toExpected },
          Content: {
            Simple: {
              Subject: { Data: 'Sign-in code 1234', Charset: 'utf8' },
              Body: {
                Html: {
                  Data: 'Your code is 1234, 1234 is your code',
                },
              },
            },
          },
          FeedbackForwardingEmailAddress: undefined,
          FeedbackForwardingEmailAddressIdentityArn: undefined,
          FromEmailAddressIdentityArn: undefined,
          ConfigurationSetName: undefined,
        },
      })
    );
  });

  it('should call SendMail() with correct template and content (2)', async () => {
    const connector = await createConnector({ getConfig });
    const toMail = 'to@email.com';
    const { emailAddress } = mockedConfig;
    await connector.sendMessage({
      to: toMail,
      type: TemplateType.OrganizationInvitation,
      payload: { code: '1234', link: 'https://logto.dev' },
    });
    const toExpected = [toMail];
    expect(SESv2Client.prototype.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          FromEmailAddress: emailAddress,
          Destination: { ToAddresses: toExpected },
          Content: {
            Simple: {
              Subject: { Data: 'Organization invitation', Charset: 'utf8' },
              Body: {
                Html: {
                  Data: 'Your link is https://logto.dev',
                },
              },
            },
          },
          FeedbackForwardingEmailAddress: undefined,
          FeedbackForwardingEmailAddressIdentityArn: undefined,
          FromEmailAddressIdentityArn: undefined,
          ConfigurationSetName: undefined,
        },
      })
    );
  });

  it('should call SendMail() with custom template', async () => {
    const connector = await createConnector({ getConfig, getI18nEmailTemplate });
    const toMail = 'to@email.com';
    const { emailAddress } = mockedConfig;
    await connector.sendMessage({
      to: toMail,
      type: TemplateType.Generic,
      payload: { code: '1234', link: 'https://logto.dev' },
    });
    const toExpected = [toMail];
    expect(SESv2Client.prototype.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          FromEmailAddress: `Foo <${emailAddress}>`,
          Destination: { ToAddresses: toExpected },
          Content: {
            Simple: {
              Subject: { Data: 'Generic email', Charset: 'utf8' },
              Body: {
                Html: {
                  Data: 'Verification code is 1234',
                },
              },
            },
          },
          FeedbackForwardingEmailAddress: undefined,
          FeedbackForwardingEmailAddressIdentityArn: undefined,
          FromEmailAddressIdentityArn: undefined,
          ConfigurationSetName: undefined,
        },
      })
    );
  });

  it('should honor sendFrom and replyTo of the i18n email template', async () => {
    const connector = await createConnector({ getConfig, getI18nEmailTemplate });
    const toMail = 'to@email.com';
    await connector.sendMessage({
      to: toMail,
      type: TemplateType.Generic,
      payload: { code: '1234', to: toMail },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
      input: {
        FromEmailAddress: `Foo <${mockedConfig.emailAddress}>`,
        ReplyToAddresses: [toMail],
      },
    });
  });

  it('should use sendFrom as is when it is a full address', async () => {
    const connector = await createConnector({
      getConfig,
      getI18nEmailTemplate: vi
        .fn()
        .mockResolvedValue({ ...mockGenericI18nEmailTemplate, sendFrom: 'Foo <foo@logto.io>' }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
      input: { FromEmailAddress: 'Foo <foo@logto.io>' },
    });
  });

  it('should not nest angle brackets when the configured address has a display name', async () => {
    const connector = await createConnector({
      getConfig: vi
        .fn()
        .mockResolvedValue({ ...mockedConfig, emailAddress: 'Logto<noreply@logto.io>' }),
      getI18nEmailTemplate: vi
        .fn()
        .mockResolvedValue({ ...mockGenericI18nEmailTemplate, sendFrom: 'Foo' }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
      input: { FromEmailAddress: 'Foo <noreply@logto.io>' },
    });
  });

  it('should omit ReplyToAddresses when replyTo renders to an empty string', async () => {
    const connector = await createConnector({
      getConfig,
      getI18nEmailTemplate: vi
        .fn()
        .mockResolvedValue({ ...mockGenericI18nEmailTemplate, replyTo: '{{code.missing}}' }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
      input: { FromEmailAddress: `Foo <${mockedConfig.emailAddress}>` },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).not.toHaveProperty(
      'input.ReplyToAddresses'
    );
  });

  it('should omit ReplyToAddresses when replyTo renders to an unresolved placeholder', async () => {
    const connector = await createConnector({
      getConfig,
      getI18nEmailTemplate: vi
        .fn()
        .mockResolvedValue({ ...mockGenericI18nEmailTemplate, replyTo: '{{user.primaryEmail}}' }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).not.toHaveProperty(
      'input.ReplyToAddresses'
    );
  });

  it('should split a long non-ASCII display name into encoded-words of at most 75 characters', async () => {
    const name = 'お客様サポートチームからのお知らせ';
    const connector = await createConnector({
      getConfig,
      getI18nEmailTemplate: vi
        .fn()
        .mockResolvedValue({ ...mockGenericI18nEmailTemplate, sendFrom: name }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    const from = (
      vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0] as {
        input: { FromEmailAddress: string };
      }
    ).input.FromEmailAddress;
    const words = from.slice(0, from.lastIndexOf(' <')).split(' ');
    expect(words.length).toBeGreaterThan(1);
    for (const word of words) {
      expect(word.length).toBeLessThanOrEqual(75);
    }
    const decoded = words
      .map((word) => Buffer.from(word.slice('=?UTF-8?B?'.length, -2), 'base64').toString('utf8'))
      .join('');
    expect(decoded).toBe(name);
  });

  it.each([['Billing @ Acme Europe'], ['Acme, Inc.']])(
    'should quote the display name %s',
    async (sendFrom) => {
      const connector = await createConnector({
        getConfig,
        getI18nEmailTemplate: vi
          .fn()
          .mockResolvedValue({ ...mockGenericI18nEmailTemplate, sendFrom }),
      });
      await connector.sendMessage({
        to: 'to@email.com',
        type: TemplateType.Generic,
        payload: { code: '1234' },
      });
      expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
        input: { FromEmailAddress: `"${sendFrom}" <${mockedConfig.emailAddress}>` },
      });
    }
  );

  it('should RFC 2047 encode a non-ASCII display name', async () => {
    const connector = await createConnector({
      getConfig,
      getI18nEmailTemplate: vi
        .fn()
        .mockResolvedValue({ ...mockGenericI18nEmailTemplate, sendFrom: 'Logto 团队' }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    const encoded = Buffer.from('Logto 团队', 'utf8').toString('base64');
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
      input: { FromEmailAddress: `=?UTF-8?B?${encoded}?= <${mockedConfig.emailAddress}>` },
    });
  });

  it('should not take a bracketed name as the address', async () => {
    const connector = await createConnector({
      getConfig,
      getI18nEmailTemplate: vi.fn().mockResolvedValue({
        ...mockGenericI18nEmailTemplate,
        sendFrom: '"Platform <EU>" <foo@logto.io>',
      }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
      input: { FromEmailAddress: 'Platform EU <foo@logto.io>' },
    });
  });

  it('should fall back to the configured address when sendFrom has no valid address', async () => {
    const connector = await createConnector({
      getConfig,
      getI18nEmailTemplate: vi
        .fn()
        .mockResolvedValue({ ...mockGenericI18nEmailTemplate, sendFrom: 'Foo <not-an-email>' }),
    });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.Generic,
      payload: { code: '1234' },
    });
    expect(vi.mocked(SESv2Client.prototype.send).mock.lastCall?.[0]).toMatchObject({
      input: { FromEmailAddress: mockedConfig.emailAddress },
    });
  });
});
