import { LogtoAccountApi } from '../api/index.js';
import { type UserProfile } from '../types.js';

type CreteMockAccountApiOptions = {
  fetchUserProfile: () => Promise<UserProfile>;
};

export const createMockAccountApi = ({
  fetchUserProfile,
}: CreteMockAccountApiOptions): LogtoAccountApi => {
  class MockAccountApi extends LogtoAccountApi {
    async fetchUserProfile(): Promise<UserProfile> {
      return fetchUserProfile();
    }
  }

  return new MockAccountApi('https://mock.logto.app', async () => 'dummy_access_token');
};
