import { createAuthenticatedKy } from './base-ky';

export const sendHeartbeat = async (accessToken: string): Promise<void> => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/sessions/heartbeat');
};
