import dashboardRoutes from '@/routes/dashboard';
import { createRequester } from '@/utils/test-utils';

const totalUserCount = 1000;
const countUsers = jest.fn(async () => ({ count: totalUserCount }));

jest.mock('@/queries/user', () => ({
  countUsers: async () => countUsers(),
}));

describe('dashboardRoutes', () => {
  const logRequest = createRequester({ authedRoutes: dashboardRoutes });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /dashboard/users/total', () => {
    it('should call countUsers with no parameters', async () => {
      await logRequest.get('/dashboard/users/total');
      expect(countUsers).toHaveBeenCalledWith();
    });

    it('/dashboard/users/total should return correct response', async () => {
      const response = await logRequest.get('/dashboard/users/total');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ totalUserCount });
    });
  });
});
