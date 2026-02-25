/**
 * Mock data for testing
 * These values are used in unit tests to simulate connector configuration and API responses
 */

/**
 * Mock connector configuration
 * Uses system-provided signature and template codes for testing
 */
export const mockedConnectorConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  signName: '速通互联验证码',
  templates: [
    {
      usageType: 'SignIn',
      templateCode: '100001',
    },
    {
      usageType: 'Register',
      templateCode: '100001',
    },
    {
      usageType: 'ForgotPassword',
      templateCode: '100003',
    },
    {
      usageType: 'Generic',
      templateCode: '100001',
    },
  ],
};

/**
 * Test phone number (Chinese mobile number format)
 */
export const phoneTest = '13012345678';

/**
 * Test verification code
 */
export const codeTest = '123456';
