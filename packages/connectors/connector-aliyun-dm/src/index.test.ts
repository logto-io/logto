import { TemplateType } from '@logto/connector-kit';

import { mockedConfigWithAllRequiredTemplates } from './mock.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConfigWithAllRequiredTemplates);

const singleSendMail = jest.fn(() => ({
  body: JSON.stringify({ EnvId: 'env-id', RequestId: 'request-id' }),
  statusCode: 200,
}));

jest.unstable_mockModule('./single-send-mail.js', () => ({
  singleSendMail,
}));

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.SignIn,
      payload: { code: '1234' },
    });
    expect(singleSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        HtmlBody: 'Your code is 1234, 1234 is your code',
      }),
      expect.anything()
    );
  });
});
