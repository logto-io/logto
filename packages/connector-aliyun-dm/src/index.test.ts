import { GetConnectorConfig, ValidateConfig } from '@logto/connector-schemas';

import AliyunDmConnector from '.';
import { mockedConfig } from './mock';
import { singleSendMail } from './single-send-mail';
import { AliyunDmConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

const aliyunDmMethods = new AliyunDmConnector(getConnectorConfig);

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

beforeAll(() => {
  jest.spyOn(aliyunDmMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Assertion functions always need explicit annotations.
   * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
   */

  it('should pass on valid config', async () => {
    const validator: ValidateConfig<AliyunDmConfig> = aliyunDmMethods.validateConfig;
    expect(() => {
      validator({
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        accountName: 'accountName',
        templates: [],
      });
    }).not.toThrow();
  });

  it('should fail if config is invalid', async () => {
    const validator: ValidateConfig<AliyunDmConfig> = aliyunDmMethods.validateConfig;
    expect(() => {
      validator({});
    }).toThrow();
  });
});

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    await aliyunDmMethods.sendMessage('to@email.com', 'SignIn', { code: '1234' });
    expect(singleSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        HtmlBody: 'Your code is 1234, 1234 is your code',
      }),
      expect.anything()
    );
  });

  it('throws if template is missing', async () => {
    await expect(
      aliyunDmMethods.sendMessage('to@email.com', 'Register', { code: '1234' })
    ).rejects.toThrow();
  });
});
