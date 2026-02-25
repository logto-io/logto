import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

/**
 * Aliyun Message Authentication Service API endpoint
 * Different from standard SMS service endpoint (dysmsapi.aliyuncs.com)
 * @doc https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode
 */
export const messageAuthEndpoint = 'https://dypnsapi.aliyuncs.com/';

/**
 * Static configuration parameters for Aliyun API requests
 * These are common parameters required for all API calls
 */
export const staticConfigs = {
  Format: 'json',
  RegionId: 'cn-hangzhou',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2017-05-25',
};

/**
 * System-provided signatures for Message Authentication Service
 * These signatures are provided by Aliyun and do not require application
 * User must select one of these in the connector configuration
 */
export const systemProvidedSignNames = [
  '云渚科技验证平台',
  '云渚科技验证服务',
  '速通互联验证码',
  '速通互联验证平台',
  '速通互联验证服务',
];

/**
 * Connector metadata
 * This defines how the connector appears in Logto Console
 */
export const defaultMetadata: ConnectorMetadata = {
  id: 'aliyun-short-message-auth-service',
  target: 'aliyun-sms-mas',
  platform: null,
  name: {
    en: 'Aliyun Message Authentication Service',
    'zh-CN': '阿里云短信认证服务',
    'tr-TR': 'Aliyun Mesaj Doğrulama Hizmeti',
    ko: 'Aliyun 메시지 인증 서비스',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Aliyun Message Authentication Service provides simplified verification code SMS with system-provided signatures and templates, no enterprise qualification required.',
    'zh-CN': '阿里云短信认证服务提供简化的验证码短信，使用指定的签名和模板，无需企业资质。',
    'tr-TR':
      "Aliyun Mesaj Doğrulama Hizmeti, sistem tarafından sağlanan imzalar ve şablonlarla basitleştirilmiş doğrulama kodu SMS'leri sunar, kurumsal nitelik gerektirmez.",
    ko: 'Aliyun 메시지 인증 서비스는 시스템 제공 서명과 템플릿을 사용하여 간소화된 인증 코드 SMS를 제공하며, 기업 자격이 필요하지 않습니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'accessKeyId',
      label: 'Access Key ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<access-key-id>',
    },
    {
      key: 'accessKeySecret',
      label: 'Access Key Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<access-key-secret>',
    },
    {
      key: 'signName',
      label: 'Signature Name',
      type: ConnectorConfigFormItemType.Select,
      required: true,
      selectItems: systemProvidedSignNames.map((name) => ({
        value: name,
        title: name,
      })),
      description:
        'Select a system-provided signature. These signatures are provided by Aliyun and do not require application.',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
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
          usageType: 'OrganizationInvitation',
          templateCode: '100001',
        },
        {
          usageType: 'Generic',
          templateCode: '100001',
        },
        {
          usageType: 'UserPermissionValidation',
          templateCode: '100005',
        },
        {
          usageType: 'BindNewIdentifier',
          templateCode: '100002',
        },
        {
          usageType: 'MfaVerification',
          templateCode: '100001',
        },
        {
          usageType: 'BindMfa',
          templateCode: '100001',
        },
      ],
      description:
        'Use system-provided template codes: 100001 (SignIn/Register/Generic), 100002 (Change Phone), 100003 (Reset Password), 100004 (Bind Phone), 100005 (Verify Phone).',
    },
  ],
};
