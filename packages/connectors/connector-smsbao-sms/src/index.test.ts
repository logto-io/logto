import nock from 'nock';

import { ConnectorErrorCodes, TemplateType } from '@logto/connector-kit';

import { endpoint } from './constant.js';
import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);
const createSendMessage = async () => {
  const connector = await createConnector({ getConfig });

  return connector.sendMessage;
};

describe('SMSBao SMS connector', () => {
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

    afterEach(() => {
      nock.cleanAll();
      vi.clearAllMocks();
    });

    it('should send message successfully', async () => {
      const sendMessage = await createSendMessage();
      const scope = nock(endpoint)
        .get('')
        .query({
          u: mockedConfig.username,
          p: mockedConfig.passwordOrApiKey,
          g: mockedConfig.goodsId,
          m: '13800138000',
          c: '您的登录验证码是 1234。如非本人操作，请忽略本短信',
        })
        .reply(200, '0');

      await expect(
        sendMessage({
          to: '13800138000',
          type: TemplateType.SignIn,
          payload: { code: '1234' },
        })
      ).resolves.not.toThrow();

      expect(scope.isDone()).toBeTruthy();
    });

    it('should omit product ID when goodsId is not configured', async () => {
      const sendMessage = await createSendMessage();
      const config = {
        ...mockedConfig,
        goodsId: undefined,
      };

      const scope = nock(endpoint)
        .get('')
        .query((query) => {
          expect(query).toMatchObject({
            u: mockedConfig.username,
            p: mockedConfig.passwordOrApiKey,
            m: '13800138000',
            c: '您的验证码是 5678。如非本人操作，请忽略本短信',
          });
          expect(query).not.toHaveProperty('g');

          return true;
        })
        .reply(200, '0');

      await expect(
        sendMessage(
          {
            to: '13800138000',
            type: TemplateType.Generic,
            payload: { code: '5678' },
          },
          config
        )
      ).resolves.not.toThrow();

      expect(scope.isDone()).toBeTruthy();
    });

    it('should throw TemplateNotFound when template is not configured', async () => {
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
            templates: [
              {
                usageType: 'Register',
                content: 'register {{code}}',
              },
              {
                usageType: 'ForgotPassword',
                content: 'forgot password {{code}}',
              },
            ],
          }
        )
      ).rejects.toMatchObject({ code: ConnectorErrorCodes.TemplateNotFound });
    });

    it('should throw general error for SMSBao error response', async () => {
      const sendMessage = await createSendMessage();

      nock(endpoint).get('').query(true).reply(200, '41');

      await expect(
        sendMessage({
          to: '13800138000',
          type: TemplateType.SignIn,
          payload: { code: '1234' },
        })
      ).rejects.toMatchObject({
        code: ConnectorErrorCodes.General,
        data: {
          message: 'SMSBao account has insufficient balance',
        },
      });
    });
  });
});
