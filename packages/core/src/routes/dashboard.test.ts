import dayjs from 'dayjs';

import dashboardRoutes from '@/routes/dashboard';
import { createRequester } from '@/utils/test-utils';

const totalUserCount = 1000;
const countUsers = jest.fn(async () => ({ count: totalUserCount }));
const getDailyNewUserCountsByTimeInterval = jest.fn(
  async (startTimeExclusive: number, endTimeInclusive: number) => mockDailyNewUserCounts
);

jest.mock('@/queries/user', () => ({
  countUsers: async () => countUsers(),
  getDailyNewUserCountsByTimeInterval: async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) => getDailyNewUserCountsByTimeInterval(startTimeExclusive, endTimeInclusive),
}));

const mockDailyNewUserCounts = [
  { date: '2022-05-01', count: 1 },
  { date: '2022-05-02', count: 2 },
  { date: '2022-05-03', count: 3 },
  { date: '2022-05-06', count: 6 },
  { date: '2022-05-07', count: 7 },
  { date: '2022-05-08', count: 8 },
  { date: '2022-05-09', count: 9 },
  { date: '2022-05-10', count: 10 },
  { date: '2022-05-13', count: 13 },
  { date: '2022-05-14', count: 14 },
];

const mockDailyActiveUserCounts = [
  { date: '2022-05-01', count: 501 },
  { date: '2022-05-23', count: 523 },
  { date: '2022-05-29', count: 529 },
  { date: '2022-05-30', count: 530 },
];

const mockActiveUserCount = 1000;

const getDailyActiveUserCountsByTimeInterval = jest.fn(
  async (startTimeExclusive: number, endTimeInclusive: number) => mockDailyActiveUserCounts
);
const countActiveUsersByTimeInterval = jest.fn(
  async (startTimeExclusive: number, endTimeInclusive: number) => ({ count: mockActiveUserCount })
);

jest.mock('@/queries/log', () => ({
  getDailyActiveUserCountsByTimeInterval: async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) => getDailyActiveUserCountsByTimeInterval(startTimeExclusive, endTimeInclusive),
  countActiveUsersByTimeInterval: async (startTimeExclusive: number, endTimeInclusive: number) =>
    countActiveUsersByTimeInterval(startTimeExclusive, endTimeInclusive),
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

  describe('GET /dashboard/users/new', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-05-14'));
    });

    it('should call getDailyNewUserCountsByTimeInterval with the time interval (14 days ago 23:59:59.999, today 23:59:59.999]', async () => {
      await logRequest.get('/dashboard/users/new');
      expect(getDailyNewUserCountsByTimeInterval).toHaveBeenCalledWith(
        dayjs().endOf('day').subtract(14, 'day').valueOf(),
        dayjs().endOf('day').valueOf()
      );
    });

    it('should return correct response', async () => {
      const response = await logRequest.get('/dashboard/users/new');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        today: {
          count: 14,
          delta: 1,
        },
        last7Days: {
          count: 54,
          delta: 35,
        },
      });
    });
  });

  describe('GET /dashboard/users/active', () => {
    const mockToday = '2022-05-30';

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(mockToday));
    });

    it('should fail when the parameter `date` does not match the date regex', async () => {
      const response = await logRequest.get('/dashboard/users/active?date=2022.5.1');
      expect(response.status).toEqual(400);
    });

    it('should call getDailyActiveUserCountsByTimeInterval with the time interval (2022-05-31, 2022-06-30] when the parameter `date` is 2022-06-30', async () => {
      const targetDate = '2022-06-30';
      await logRequest.get(`/dashboard/users/active?date=${targetDate}`);
      expect(getDailyActiveUserCountsByTimeInterval).toHaveBeenCalledWith(
        dayjs('2022-05-31').endOf('day').valueOf(),
        dayjs(targetDate).endOf('day').valueOf()
      );
    });

    it('should call getDailyActiveUserCountsByTimeInterval with the time interval (30 days ago, tomorrow] when there is no parameter `date`', async () => {
      await logRequest.get('/dashboard/users/active');
      expect(getDailyActiveUserCountsByTimeInterval).toHaveBeenCalledWith(
        dayjs('2022-04-30').endOf('day').valueOf(),
        dayjs(mockToday).endOf('day').valueOf()
      );
    });

    it('should call countActiveUsersByTimeInterval with correct parameters when the parameter `date` is 2022-06-30', async () => {
      const targetDate = '2022-06-30';
      await logRequest.get(`/dashboard/users/active?date=${targetDate}`);
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        1,
        dayjs('2022-06-16').endOf('day').valueOf(),
        dayjs('2022-06-23').endOf('day').valueOf()
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        2,
        dayjs('2022-06-23').endOf('day').valueOf(),
        dayjs(targetDate).endOf('day').valueOf()
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        3,
        dayjs('2022-05-01').endOf('day').valueOf(),
        dayjs('2022-05-31').endOf('day').valueOf()
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        4,
        dayjs('2022-05-31').endOf('day').valueOf(),
        dayjs(targetDate).endOf('day').valueOf()
      );
    });

    it('should call countActiveUsersByTimeInterval with correct parameters when there is no parameter `date`', async () => {
      await logRequest.get('/dashboard/users/active');
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        1,
        dayjs('2022-05-16').endOf('day').valueOf(),
        dayjs('2022-05-23').endOf('day').valueOf()
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        2,
        dayjs('2022-05-23').endOf('day').valueOf(),
        dayjs(mockToday).endOf('day').valueOf()
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        3,
        dayjs('2022-03-31').endOf('day').valueOf(),
        dayjs('2022-04-30').endOf('day').valueOf()
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        4,
        dayjs('2022-04-30').endOf('day').valueOf(),
        dayjs(mockToday).endOf('day').valueOf()
      );
    });

    it('should return correct response', async () => {
      const response = await logRequest.get('/dashboard/users/active');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        dauCurve: [
          { date: '2022-05-01', count: 501 },
          { date: '2022-05-02', count: 0 },
          { date: '2022-05-03', count: 0 },
          { date: '2022-05-04', count: 0 },
          { date: '2022-05-05', count: 0 },
          { date: '2022-05-06', count: 0 },
          { date: '2022-05-07', count: 0 },
          { date: '2022-05-08', count: 0 },
          { date: '2022-05-09', count: 0 },
          { date: '2022-05-10', count: 0 },
          { date: '2022-05-11', count: 0 },
          { date: '2022-05-12', count: 0 },
          { date: '2022-05-13', count: 0 },
          { date: '2022-05-14', count: 0 },
          { date: '2022-05-15', count: 0 },
          { date: '2022-05-16', count: 0 },
          { date: '2022-05-17', count: 0 },
          { date: '2022-05-18', count: 0 },
          { date: '2022-05-19', count: 0 },
          { date: '2022-05-20', count: 0 },
          { date: '2022-05-21', count: 0 },
          { date: '2022-05-22', count: 0 },
          { date: '2022-05-23', count: 523 },
          { date: '2022-05-24', count: 0 },
          { date: '2022-05-25', count: 0 },
          { date: '2022-05-26', count: 0 },
          { date: '2022-05-27', count: 0 },
          { date: '2022-05-28', count: 0 },
          { date: '2022-05-29', count: 529 },
          { date: '2022-05-30', count: 530 },
        ],
        dau: { count: 530, delta: 1 },
        wau: { count: 1000, delta: 0 },
        mau: { count: 1000, delta: 0 },
      });
    });
  });
});
