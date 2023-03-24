import { authedAdminApi } from './api.js';

export type StatisticsData = {
  count: number;
  delta: number;
};

export type TotalUserCountData = {
  totalUserCount: number;
};

export type NewUserStatistics = {
  today: StatisticsData;
  last7Days: StatisticsData;
};

export type ActiveUserStatistics = {
  dauCurve: StatisticsData[];
  dau: StatisticsData;
  wau: StatisticsData;
  mau: StatisticsData;
};

export const getTotalUsersCount = async () =>
  authedAdminApi.get('dashboard/users/total').json<TotalUserCountData>();

export const getNewUsersData = async () =>
  authedAdminApi.get('dashboard/users/new').json<NewUserStatistics>();

export const getActiveUsersData = async () =>
  authedAdminApi.get('dashboard/users/active').json<ActiveUserStatistics>();
