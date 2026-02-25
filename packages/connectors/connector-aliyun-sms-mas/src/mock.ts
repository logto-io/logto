/**
 * Mock data for testing
 * These values are used in unit tests to simulate connector configuration and API responses
 */

/**
 * Mock connector configuration
 * Uses system-provided signature and template codes for testing
 * Includes all required template usage types
 */
export const mockedConnectorConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  signName: '速通互联验证码',
  templates: [
    { usageType: 'SignIn', templateCode: '100001' },
    { usageType: 'Register', templateCode: '100001' },
    { usageType: 'ForgotPassword', templateCode: '100003' },
    { usageType: 'Generic', templateCode: '100001' },
    { usageType: 'UserPermissionValidation', templateCode: '100005' },
    { usageType: 'BindNewIdentifier', templateCode: '100002' },
    { usageType: 'OrganizationInvitation', templateCode: '100001' },
    { usageType: 'MfaVerification', templateCode: '100001' },
    { usageType: 'BindMfa', templateCode: '100001' },
  ],
};

/**
 * Test phone number (Chinese mobile number format without country code)
 * MAS only supports China mainland numbers
 */
export const phoneTest = '13012345678';

/**
 * Test verification code
 */
export const codeTest = '123456';
