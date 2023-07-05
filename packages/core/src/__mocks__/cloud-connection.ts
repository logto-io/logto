import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';

export const mockCloudConnectionLibrary: CloudConnectionLibrary = {
  getCloudConnectionData: async () => ({
    resource: 'https://logto.dev',
    appId: 'appId',
    appSecret: 'appSecret',
    endpoint: 'https://logto.dev/api',
    tokenEndpoint: 'https://logto.dev/oidc/token',
  }),
};
