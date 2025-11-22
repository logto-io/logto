import type { AccountCenter } from '@logto/schemas';
import ky from 'ky';

export const getAccountCenterSettings = async (): Promise<AccountCenter> => {
  return ky.get('/api/.well-known/account-center').json<AccountCenter>();
};
