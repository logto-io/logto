import { TemplateType } from '@logto/connector-kit';

import { mockedConnectorConfig, phoneTest, codeTest } from './mock.js';

/**
 * Mock getConfig function that returns the mock connector configuration
 */
const getConfig = vi.fn().mockResolvedValue(mockedConnectorConfig);

/**
 * Mock sendSmsVerifyCode function that simulates successful API response
 */
const sendSmsVerifyCode = vi.fn().mockResolvedValue({
  body: JSON.stringify({
    Code: 'OK',
    RequestId: 'request-id',
    Message: 'OK',
    Model: {
      VerifyCode: codeTest,
      RequestId: 'model-request-id',
      BizId: 'biz-id',
    },
  }),
  statusCode: 200,
});

/**
 * Mock the send-verify-code module
 */
vi.mock('./send-verify-code.js', () => ({
  sendSmsVerifyCode,
}));

/**
 * Import the connector factory after setting up mocks
 */
const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test that sendSmsVerifyCode is called with correct parameters
   * including default min value (10 minutes)
   */
  it('should call sendSmsVerifyCode() with correct parameters', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: TemplateType.SignIn,
      payload: { code: codeTest, locale: 'zh-CN' },
    });
    expect(sendSmsVerifyCode).toHaveBeenCalledWith(
      expect.objectContaining({
        AccessKeyId: mockedConnectorConfig.accessKeyId,
        PhoneNumber: phoneTest,
        SignName: mockedConnectorConfig.signName,
        TemplateCode: '100001',
        TemplateParam: `{"code":"${codeTest}","min":"10"}`,
      }),
      mockedConnectorConfig.accessKeySecret
    );
  });

  /**
   * Test that custom min parameter is respected when provided
   */
  it('should use custom min parameter when provided', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: TemplateType.SignIn,
      payload: { code: codeTest, min: '5' },
    });
    expect(sendSmsVerifyCode).toHaveBeenCalledWith(
      expect.objectContaining({
        TemplateParam: `{"code":"${codeTest}","min":"5"}`,
      }),
      mockedConnectorConfig.accessKeySecret
    );
  });
});
