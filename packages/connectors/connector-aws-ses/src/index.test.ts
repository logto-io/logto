import { SESv2Client } from '@aws-sdk/client-sesv2';
import { VerificationCodeType } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

jest.spyOn(SESv2Client.prototype, 'send').mockResolvedValue({
  MessageId: 'mocked-message-id',
  $metadata: {
    httpStatusCode: 200,
  },
} as never);

describe('sendMessage()', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call SendMail() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    const toMail = 'to@email.com';
    const { emailAddress } = mockedConfig;
    await connector.sendMessage({
      to: toMail,
      type: VerificationCodeType.SignIn,
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
              Subject: { Data: 'subject', Charset: 'utf8' },
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

  it('throws if template is missing', async () => {
    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: 'to@email.com',
        type: VerificationCodeType.Test,
        payload: { code: '1234' },
      })
    ).rejects.toThrow();
  });
});
