import type router from '@logto/cloud/routes';
import Client from '@withtyped/client';

import { type LogtoConfigLibrary } from '#src/libraries/logto-config.js';

const { jest } = import.meta;

export const mockLogtoConfigsLibrary: jest.Mocked<LogtoConfigLibrary> = {
  getCloudConnectionData: jest.fn(),
  getOidcConfigs: jest.fn(),
  upsertJwtCustomizer: jest.fn(),
  getJwtCustomizer: jest.fn(),
  getJwtCustomizers: jest.fn(),
  updateJwtCustomizer: jest.fn(),
};

export const mockCloudClient = new Client<typeof router>({ baseUrl: 'http://localhost:3001' });
