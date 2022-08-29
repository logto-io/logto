export type CountAndDelta = {
  count: number;
  delta: number;
};

export type TotalUsersResponse = {
  totalUserCount: number;
};

export type NewUsersResponse = {
  today: CountAndDelta;
  last7Days: CountAndDelta;
};

export type ActiveUsersResponse = {
  dau: CountAndDelta;
  wau: CountAndDelta;
  mau: CountAndDelta;
  dauCurve: Array<{ date: string; count: number }>;
};
