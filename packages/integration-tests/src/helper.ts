import { User } from '@logto/schemas';

import { authedAdminApi } from './api';
import { generateUsername, generatePassword } from './utils';

export const createUser = () => {
  const username = generateUsername();

  return authedAdminApi
    .post('users', {
      json: {
        username,
        password: generatePassword(),
        name: username,
      },
    })
    .json<User>();
};
