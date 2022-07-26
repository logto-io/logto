import { getEnv } from '@silverhand/essentials';

const defaultPackages = [
  '@logto/connector-alipay-web',
  '@logto/connector-alipay-native',
  '@logto/connector-aliyun-dm',
  '@logto/connector-aliyun-sms',
  '@logto/connector-apple',
  '@logto/connector-facebook',
  '@logto/connector-github',
  '@logto/connector-google',
  '@logto/connector-azuread',
  '@logto/connector-sendgrid-email',
  '@logto/connector-smtp',
  '@logto/connector-twilio-sms',
  '@logto/connector-wechat-web',
  '@logto/connector-wechat-native',
];

const additionalConnectorPackages = getEnv('ADDITIONAL_CONNECTOR_PACKAGES', '')
  .split(',')
  .filter(Boolean);

export const connectorPackages = [...defaultPackages, ...additionalConnectorPackages];
