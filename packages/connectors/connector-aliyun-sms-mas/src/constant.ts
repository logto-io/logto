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
    en: 'Uses Aliyun Message Authentication Service as a delivery channel only. Sends Logto-generated verification codes via Aliyun system-provided signatures and templates. Does not use Aliyun-managed verification or lifecycle features. Mainland China numbers only.',
    'zh-CN': '仅将阿里云短信认证服务用作短信发送通道，通过阿里云系统赠送的签名和模板发送 Logto 生成的验证码。不使用阿里云的验证码生成、校验及生命周期管理功能。仅支持中国大陆手机号。',
    'tr-TR':
      "Aliyun Mesaj Doğrulama Hizmeti yalnızca bir teslimat kanalı olarak kullanılır. Logto tarafından oluşturulan doğrulama kodları, Aliyun sistem tarafından sağlanan imzalar ve şablonlar üzerinden gönderilir. Aliyun tarafından yönetilen doğrulama veya yaşam döngüsü özellikleri kullanılmaz. Yalnızca Çin anakara numaraları desteklenir.",
    ko: 'Aliyun 메시지 인증 서비스는 전달 채널로만 사용됩니다. Logto에서 생성한 인증 코드를 Aliyun 시스템 제공 서명과 템플릿으로 전송합니다. Aliyun 관리 인증 또는 수명 주기 기능은 사용하지 않습니다. 중국 본토 번호만 지원됩니다.',
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
