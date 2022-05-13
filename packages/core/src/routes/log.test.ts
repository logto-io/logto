import { UserLogCondition } from '@/queries/log';
import logRoutes from '@/routes/log';
import { createRequester } from '@/utils/test-utils';

const mockUserLogs = [{ id: 1 }, { id: 2 }];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const countUserLogs = jest.fn(async (condition: UserLogCondition) => ({
  count: mockUserLogs.length,
}));
const findUserLogs = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (limit: number, offset: number, condition: UserLogCondition) => mockUserLogs
);

jest.mock('@/queries/log', () => ({
  countUserLogs: async (condition: UserLogCondition) => countUserLogs(condition),
  findUserLogs: async (limit: number, offset: number, condition: UserLogCondition) =>
    findUserLogs(limit, offset, condition),
}));

describe('logRoutes', () => {
  const userRequest = createRequester({ authedRoutes: logRoutes });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users/:id/logs should call countUserLogs and findUserLogs with correct parameters', async () => {
    const userId = 'userIdValue';
    const applicationId = 'foo';
    const logType = 'SignInUsernamePassword';
    const page = 1;
    const pageSize = 5;

    await userRequest.get(
      `/users/${userId}/logs?applicationId=${applicationId}&logType=${logType}&page=${page}&page_size=${pageSize}`
    );
    expect(countUserLogs).toHaveBeenCalledWith({ userId, applicationId, logType });
    expect(findUserLogs).toHaveBeenCalledWith(5, 0, { userId, applicationId, logType });
  });

  it('GET /users/:id/logs should return correct response', async () => {
    const userId = 'userIdValue';
    const response = await userRequest.get(`/users/${userId}/logs`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockUserLogs);
    expect(response.header).toHaveProperty('total-number', `${mockUserLogs.length}`);
  });
});
