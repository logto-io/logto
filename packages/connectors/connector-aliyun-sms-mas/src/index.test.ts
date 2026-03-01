import { TemplateType } from '@logto/connector-kit';

import { mockedConnectorConfig, phoneTest, codeTest } from './mock.js';

/**
 * Mock getConfig function that returns the mock connector configuration
 */
const getConfig = vi.fn().mockResolvedValue(mockedConnectorConfig);

type SendSmsVerifyCodeInput = Record<string, string>;

type SendSmsVerifyCodeResult = {
  body: string;
  statusCode: number;
};

/**
 * Mock sendSmsVerifyCode function that simulates successful API response
 */
const sendSmsVerifyCode = vi
  .fn<
    (request: SendSmsVerifyCodeInput, accessKeySecret: string) => Promise<SendSmsVerifyCodeResult>
  >()
  .mockResolvedValue({
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
    const [sendRequest, accessKeySecret] = sendSmsVerifyCode.mock.calls[0] ?? [];

    expect(sendRequest).toMatchObject({
      AccessKeyId: mockedConnectorConfig.accessKeyId,
      CountryCode: '86',
      PhoneNumber: phoneTest,
      SignName: mockedConnectorConfig.signName,
      TemplateCode: '100001',
      TemplateParam: `{"code":"${codeTest}","min":"10"}`,
    });
    expect(accessKeySecret).toBe(mockedConnectorConfig.accessKeySecret);
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
    const [sendRequest] = sendSmsVerifyCode.mock.calls[0] ?? [];

    expect(sendRequest).toMatchObject({
      TemplateCode: expectedTemplateCode,
    });
  });

  it('should strip country code prefix before sending to MAS API', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: `86${phoneTest}`,
      type: TemplateType.SignIn,
      payload: { code: codeTest },
    });
    const [sendRequest] = sendSmsVerifyCode.mock.calls[0] ?? [];

    expect(sendRequest).toMatchObject({
      CountryCode: '86',
      PhoneNumber: phoneTest,
    });
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

describe('sendMessage() with strictPhoneRegionNumberCheck', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw invalid_request_parameters for non-mainland number in strict mode', async () => {
    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage(
        {
          to: '+1123123123',
          type: TemplateType.SignIn,
          payload: { code: codeTest },
        },
        {
          ...mockedConnectorConfig,
          strictPhoneRegionNumberCheck: true,
        }
      )
    ).rejects.toMatchObject({
      code: 'invalid_request_parameters',
    });

    expect(sendSmsVerifyCode).not.toHaveBeenCalled();
  });

  it('should allow mainland number in strict mode', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage(
      {
        to: `+86${phoneTest}`,
        type: TemplateType.SignIn,
        payload: { code: codeTest },
      },
      {
        ...mockedConnectorConfig,
        strictPhoneRegionNumberCheck: true,
      }
    );

    const [sendRequest] = sendSmsVerifyCode.mock.calls[0] ?? [];

    expect(sendRequest).toMatchObject({
      CountryCode: '86',
      PhoneNumber: phoneTest,
    });
  });
});
