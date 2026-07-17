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
    en: 'Uses Aliyun Message Authentication Service as a delivery channel. Sends verification codes via Aliyun system-provided signatures and templates. Mainland China numbers only.',
    'zh-CN':
      '将阿里云短信认证服务用作短信发送通道，通过阿里云系统赠送的签名和模板发送验证码。仅支持中国大陆手机号。',
    'tr-TR':
      'Aliyun Mesaj Doğrulama Hizmetini teslimat kanalı olarak kullanır. Aliyun sistem tarafından sağlanan imzalar ve şablonlar aracılığıyla doğrulama kodları gönderir. Sadece Çin ana karası numaraları desteklenir.',
    ko: 'Aliyun 메시지 인증 서비스를 전달 채널로 사용합니다. Aliyun 시스템에서 제공하는 서명과 템플릿을 통해 인증 코드를 보냅니다. 중국 본토 번호만 지원됩니다.',
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
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<signature-name>',
      description:
        'Copy a current gift signature from your Aliyun Message Authentication Service console (号码认证 → 短信认证参数配置 → 赠送签名配置).',
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
