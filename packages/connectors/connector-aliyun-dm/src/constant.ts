import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultRegionId = 'cn-hangzhou';

export const regionIds = [
  'cn-hangzhou',
  'ap-southeast-1',
  'ap-southeast-2',
  'eu-central-1',
  'us-east-1',
] as const;

export type RegionId = (typeof regionIds)[number];

export const regionConfigs: Record<RegionId, { title: string; endpoint: string }> = Object.freeze({
  'cn-hangzhou': {
    title: 'China (Hangzhou)',
    endpoint: 'https://dm.aliyuncs.com/',
  },
  'ap-southeast-1': {
    title: 'Singapore',
    endpoint: 'https://dm.ap-southeast-1.aliyuncs.com/',
  },
  'ap-southeast-2': {
    title: 'United States (formerly Sydney)',
    endpoint: 'https://dm.ap-southeast-2.aliyuncs.com/',
  },
  'eu-central-1': {
    title: 'Germany (Frankfurt)',
    endpoint: 'https://dm.eu-central-1.aliyuncs.com/',
  },
  'us-east-1': {
    title: 'US (Virginia)',
    endpoint: 'https://dm.us-east-1.aliyuncs.com/',
  },
});

export const getEndpoint = (regionId: RegionId = defaultRegionId) =>
  regionConfigs[regionId].endpoint;

export const staticConfigs = {
  Format: 'json',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2015-11-23',
};

export const defaultMetadata: ConnectorMetadata = {
  id: 'aliyun-direct-mail',
  target: 'aliyun-dm',
  platform: null,
  name: {
    en: 'Aliyun Direct Mail',
    'zh-CN': '阿里云邮件推送',
    'tr-TR': 'Aliyun Direct Mail',
    ko: 'Aliyun 다이렉트 메일',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Aliyun provides cloud computing services to online businesses.',
    'zh-CN': '阿里云是全球性的云服务提供商。',
    'tr-TR': 'Aliyun, çevrimiçi işletmelere bulut bilişim hizmetleri sunmaktadır.',
    ko: 'Aliyun는 온라인 비지니스를 위해 클라우딩 컴퓨팅 서비스를 제공합니다.',
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
      key: 'regionId',
      label: 'Region',
      type: ConnectorConfigFormItemType.Select,
      required: false,
      defaultValue: defaultRegionId,
      selectItems: regionIds.map((value) => ({
        value,
        title: regionConfigs[value].title,
      })),
      description: 'Select the Direct Mail region where the sender address is configured.',
    },
    {
      key: 'accountName',
      label: 'Account Name',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<account-name>',
    },
    {
      key: 'fromAlias',
      label: 'From Alias',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<from-alias>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          subject: '<sign-in-template-subject>',
          content:
            'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Register',
          subject: '<register-template-subject>',
          content:
            'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'ForgotPassword',
          subject: '<forgot-password-template-subject>',
          content:
            'Your Logto password change verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'OrganizationInvitation',
          subject: '<organization-invitation-template-subject>',
          content:
            'Your Logto organization invitation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Generic',
          subject: '<generic-template-subject>',
          content:
            'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'UserPermissionValidation',
          subject: '<user-permission-validation-template-subject>',
          content:
            'Your Logto permission validation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindNewIdentifier',
          subject: '<bind-new-identifier-template-subject>',
          content:
            'Your Logto new identifier binding code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'MfaVerification',
          subject: '<mfa-verification-template-subject>',
          content:
            'Your Logto MFA verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindMfa',
          subject: '<bind-mfa-template-subject>',
          content:
            'Your Logto 2-step verification setup code is {{code}}. The code will remain active for 10 minutes.',
        },
      ],
    },
  ],
};
