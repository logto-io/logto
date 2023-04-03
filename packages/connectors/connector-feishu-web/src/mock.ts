import type { FeishuConfig } from './types.js';

export const mockedTimestamp = '2022-02-22 22:22:22';

export const mockedFeishuConfig: FeishuConfig = {
  appId: '1112233',
  appSecret: '445566',
};

export const mockedFeishuPublicParameters = {
  format: 'JSON',
  grantType: 'authorization_code',
  timestamp: mockedTimestamp,
  version: '1.0',
  method: '<method-placeholder>',
};
