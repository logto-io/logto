import { SESv2Client } from '@aws-sdk/client-sesv2';
import { TemplateType } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

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
});
