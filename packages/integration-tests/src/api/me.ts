import { ArbitraryObject, UserInfo } from '@logto/schemas';

import api from './api';

export const getCurrentUserInfo = (userId: string) =>
  api.get(`me`, { headers: { 'development-user-id': userId } }).json<UserInfo>();

export const getCurrentUserCustomData = (userId: string) =>
  api
    .get('me/custom-data', {
      headers: {
        'development-user-id': userId,
      },
    })
    .json<ArbitraryObject>();

export const updateCurrentUserCustomDate = (userId: string, payload: Record<string, unknown>) =>
  api.patch('me/custom-data', {
    headers: {
      'development-user-id': userId,
    },
    json: {
      customData: payload,
    },
  });

export const changeCurrentUserPassword = (userId: string, password: string) =>
  api.patch('me/password', {
    headers: {
      'development-user-id': userId,
    },
    json: {
      password,
    },
  });
