export const mockedConfig = {
  clientId: '<client-id>',
  clientSecret: '<client-secret>',
  redirectUri: 'http://localhost:3000/callback',
  skipConfirm: true,
};

export const mockedAccessTokenResponse = {
  access_token: 'access_token',
  expires_in: 3600,
  refresh_token: 'refresh_token',
  scope: '1',
  openId: 'openId',
  union_id: 'union_id',
};

export const mockedUserInfoResponse = {
  result: 'ok',
  code: 0,
  description: 'no error',
  data: {
    miliaoNick: 'Test User',
    unionId: 'union_id',
    miliaoIcon: 'https://avatar.example.com/user.jpg',
  },
};
