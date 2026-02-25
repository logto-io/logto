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
   * including fixed min value (10 minutes) - Logto uses fixed 10-min expiration
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
   * Test all supported template types
   */
  it.each([
    [TemplateType.SignIn, '100001'],
    [TemplateType.Register, '100001'],
    [TemplateType.ForgotPassword, '100003'],
    [TemplateType.Generic, '100001'],
    [TemplateType.UserPermissionValidation, '100005'],
    [TemplateType.BindNewIdentifier, '100002'],
    [TemplateType.OrganizationInvitation, '100001'],
    [TemplateType.MfaVerification, '100001'],
    [TemplateType.BindMfa, '100001'],
  ])('should use correct template code for %s', async (type, expectedTemplateCode) => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type,
      payload: { code: codeTest },
    });
    expect(sendSmsVerifyCode).toHaveBeenCalledWith(
      expect.objectContaining({
        TemplateCode: expectedTemplateCode,
      }),
      expect.any(String)
    );
  });
});

describe('sendMessage() with API errors', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test that BUSINESS_LIMIT_CONTROL error throws RateLimitExceeded
   */
  it('should throw RateLimitExceeded for BUSINESS_LIMIT_CONTROL error', async () => {
    sendSmsVerifyCode.mockResolvedValueOnce({
      body: JSON.stringify({
        Code: 'BUSINESS_LIMIT_CONTROL',
        Message: 'The number has exceeded the limit for the day.',
        RequestId: 'request-id',
      }),
      statusCode: 200,
    });

    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: phoneTest,
        type: TemplateType.SignIn,
        payload: { code: codeTest },
      })
    ).rejects.toMatchObject({
      code: 'rate_limit_exceeded',
    });
  });

  /**
   * Test that general API error throws General error
   */
  it('should throw General error for other API errors', async () => {
    sendSmsVerifyCode.mockResolvedValueOnce({
      body: JSON.stringify({
        Code: 'MOBILE_NUMBER_ILLEGAL',
        Message: 'The mobile number is illegal.',
        RequestId: 'request-id',
      }),
      statusCode: 200,
    });

    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: phoneTest,
        type: TemplateType.SignIn,
        payload: { code: codeTest },
      })
    ).rejects.toMatchObject({
      code: 'general',
    });
  });
});
