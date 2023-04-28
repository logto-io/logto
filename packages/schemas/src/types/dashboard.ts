import { number, object, array, string } from 'zod';

const dashboardUsersDataGuard = object({
  count: number(),
  delta: number(),
});

export const getNewUsersResponseGuard = object({
  today: dashboardUsersDataGuard,
  last7Days: dashboardUsersDataGuard,
});

export const getActiveUsersResponseGuard = object({
  dauCurve: array(
    object({
      date: string(),
      count: number(),
    })
  ),
  dau: dashboardUsersDataGuard,
  wau: dashboardUsersDataGuard,
  mau: dashboardUsersDataGuard,
});
