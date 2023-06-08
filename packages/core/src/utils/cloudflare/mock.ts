import { mockCloudflareData } from '#src/__mocks__/domain.js';

export const mockCustomHostnameResponse = async (identifier?: string) => {
  return mockCloudflareData;
};

export const mockFallbackOrigin = 'mock.logto.dev';
