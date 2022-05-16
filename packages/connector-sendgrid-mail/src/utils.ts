import got from 'got';

import { endpoint } from './constant';
import { PublicParameters } from './types';

export const request = async <T>(parameters: PublicParameters, apiKey: string) => {
  return got.post<T>({
    url: endpoint,
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    json: parameters,
  });
};
