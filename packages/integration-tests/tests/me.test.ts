import { ArbitraryObject, User } from '@logto/schemas';

import api, { authedAdminApi } from '@/api';
import { generatePassword, generateUsername } from '@/utils';

const createUser = async () => {
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

describe('api `/me`', () => {
  it('should get user custom data', async () => {
    const user = await createUser();
    const customData = await api
      .get('me/custom-data', {
        headers: {
          'development-user-id': user.id,
        },
      })
      .json<ArbitraryObject>();

    expect(customData).toEqual({});
  });

  it('should update user custom data', async () => {
    const user = await createUser();

    const developmentUserHeaders = {
      'development-user-id': user.id,
    };

    const newCustomData = {
      foo: 'bar',
    };

    await api.patch('me/custom-data', {
      headers: { ...developmentUserHeaders },
      json: {
        customData: newCustomData,
      },
    });

    const customData = await api
      .get('me/custom-data', {
        headers: { ...developmentUserHeaders },
      })
      .json<ArbitraryObject>();

    expect(customData).toEqual(newCustomData);
  });

  it('should change user password', async () => {
    const user = await createUser();
    const password = generatePassword();
    const changePasswordResponse = await api.patch('me/password', {
      headers: {
        'development-user-id': user.id,
      },
      json: {
        password,
      },
    });

    expect(changePasswordResponse.statusCode).toBe(204);
  });
});
