import { MessageTypes } from '@logto/connector-core';

import createConnector from '.';
import { mockedConfig } from './mock';
import { singleSendMail } from './single-send-mail';

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

jest.mock('./single-send-mail', () => {
  return {
    singleSendMail: jest.fn(() => {
      return {
        body: JSON.stringify({ EnvId: 'env-id', RequestId: 'request-id' }),
        statusCode: 200,
      };
    }),
  };
});

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: 'to@email.com',
      type: MessageTypes.SignIn,
      payload: { code: '1234' },
    });
    expect(singleSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        HtmlBody: 'Your code is 1234, 1234 is your code',
      }),
      expect.anything()
    );
  });

  it('throws if template is missing', async () => {
    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: 'to@email.com',
        type: MessageTypes.Register,
        payload: { code: '1234' },
      })
    ).rejects.toThrow();
  });
});
