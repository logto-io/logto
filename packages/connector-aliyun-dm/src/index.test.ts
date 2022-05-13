import { GetConnectorConfig } from '@logto/connector-types';

import { AliyunDmConnector } from '.';
import { mockedConfig } from './mock';
import { singleSendMail } from './single-send-mail';
import { AliyunDmConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<AliyunDmConfig>;

const aliyunDmMethods = new AliyunDmConnector(getConnectorConfig);

jest.mock('./single-send-mail');

beforeAll(() => {
  jest.spyOn(aliyunDmMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(
      aliyunDmMethods.validateConfig({
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        accountName: 'accountName',
        templates: [],
      })
    ).resolves.not.toThrow();
  });

  it('throws if config is invalid', async () => {
    await expect(aliyunDmMethods.validateConfig({})).rejects.toThrow();
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
