import dashboardRoutes from '@/routes/dashboard';
import { createRequester } from '@/utils/test-utils';

const totalUserCount = 1000;

jest.mock('@/queries/user', () => ({
  countUsers: async () => ({ count: totalUserCount }),
}));

describe('dashboardRoutes', () => {
  const logRequest = createRequester({ authedRoutes: dashboardRoutes });

  test('/dashboard/users/total should return correct response', async () => {
    const response = await logRequest.get('/dashboard/users/total');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ totalUserCount });
  });
});
