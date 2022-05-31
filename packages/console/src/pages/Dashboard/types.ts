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
