import { ConnectorError, ConnectorErrorCodes, GeneralConnector } from '@logto/connector-core';

import { LogtoConnector } from './types';

export const defaultConnectorPackages = [
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
  '@logto/connector-kakao',
];

const notImplemented = () => {
  throw new ConnectorError(ConnectorErrorCodes.NotImplemented);
};

export const defaultConnectorMethods = {
  getAuthorizationUri: notImplemented,
  getUserInfo: notImplemented,
  sendMessage: notImplemented,
  validateConfig: notImplemented,
};
