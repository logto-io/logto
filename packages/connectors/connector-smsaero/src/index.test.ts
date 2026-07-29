import got from 'got';
import nock from 'nock';

import { ConnectorErrorCodes, TemplateType } from '@logto/connector-kit';

import { endpoint } from './constant.js';
import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn();
const createSendMessage = async () => {
  const connector = await createConnector({ getConfig });

  return connector.sendMessage;
};

describe('SMSAero SMS connector', () => {
  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  describe('sendMessage()', () => {
    beforeAll(() => {
      nock.disableNetConnect();
    });

    afterAll(() => {
      nock.enableNetConnect();
    });

    beforeEach(() => {
      getConfig.mockReset();
      getConfig.mockResolvedValue(mockedConfig);
    });

    afterEach(() => {
      nock.cleanAll();
      vi.restoreAllMocks();
    });

    it('should send message successfully', async () => {
      const sendMessage = await createSendMessage();
      const scope = nock(endpoint)
        .post('', {
          number: '13800138000',
          sign: mockedConfig.senderName,
          text: 'This is for testing purposes only. Your verification code is 1234.',
        })
        .basicAuth({ user: mockedConfig.email, pass: mockedConfig.apiKey })
        .reply(200, { id: 1, from: mockedConfig.senderName, number: '13800138000', status: 0 });

      await expect(
        sendMessage({
          to: '13800138000',
          type: TemplateType.Generic,
          payload: { code: '1234' },
        })
      ).resolves.not.toThrow();

      expect(scope.isDone()).toBeTruthy();
    });

    it('should send message with custom config', async () => {
      const sendMessage = await createSendMessage();
      const customConfig = {
        ...mockedConfig,
        senderName: 'custom-sender',
      };
      const scope = nock(endpoint)
        .post('', {
          number: '13800138000',
          sign: 'custom-sender',
          text: 'This is for testing purposes only. Your verification code is 5678.',
        })
        .reply(200, { id: 2, status: 0 });

      await expect(
        sendMessage(
          {
            to: '13800138000',
            type: TemplateType.Generic,
            payload: { code: '5678' },
          },
          customConfig
        )
      ).resolves.not.toThrow();

      expect(getConfig).not.toHaveBeenCalled();
      expect(scope.isDone()).toBeTruthy();
    });

    it('should throw TemplateNotFound when template is not configured', async () => {
      const sendMessage = await createSendMessage();

      await expect(
        sendMessage({
          to: '13800138000',
          type: TemplateType.SignIn,
          payload: { code: '1234' },
        })
      ).rejects.toMatchObject({ code: ConnectorErrorCodes.TemplateNotFound });
    });

    it('should throw TemplateNotFound when custom config lacks the template', async () => {
      const sendMessage = await createSendMessage();

      await expect(
        sendMessage(
          {
            to: '13800138000',
            type: TemplateType.SignIn,
            payload: { code: '1234' },
          },
          {
            ...mockedConfig,
            templates: [{ usageType: 'Register', content: 'register {{code}}' }],
          }
        )
      ).rejects.toMatchObject({ code: ConnectorErrorCodes.TemplateNotFound });
    });

    it('should throw General error for HTTP error response', async () => {
      const sendMessage = await createSendMessage();

      const scope = nock(endpoint).post('').reply(400, 'some error body');

      await expect(
        sendMessage({
          to: '13800138000',
          type: TemplateType.Generic,
          payload: { code: '1234' },
        })
      ).rejects.toMatchObject({
        code: ConnectorErrorCodes.General,
        data: { message: 'some error body' },
      });

      expect(scope.isDone()).toBeTruthy();
    });

    it('should rethrow unknown error', async () => {
      const sendMessage = await createSendMessage();
      const error = new Error('unknown error');

      vi.spyOn(got, 'post').mockRejectedValueOnce(error);

      await expect(
        sendMessage({
          to: '13800138000',
          type: TemplateType.Generic,
          payload: { code: '1234' },
        })
      ).rejects.toThrow(error);
    });
  });
});
