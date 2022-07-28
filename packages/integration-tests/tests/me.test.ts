import { ArbitraryObject, UserInfo, userInfoSelectFields } from '@logto/schemas';

import { api } from '@/api';
import { createUserByAdmin } from '@/helpers';
import { generatePassword } from '@/utils';

describe('api `/me`', () => {
  it('should get user info successfully', async () => {
    const user = await createUserByAdmin();
    const userInfo = await api
      .get(`me`, { headers: { 'development-user-id': user.id } })
      .json<UserInfo>();

    expect(userInfo.id).toBe(user.id);

    for (const field of userInfoSelectFields) {
      expect(userInfo).toHaveProperty(field);
    }
  });

  it('should get user custom data successfully', async () => {
    const user = await createUserByAdmin();
    const customData = await api
      .get('me/custom-data', {
        headers: {
          'development-user-id': user.id,
        },
      })
      .json<ArbitraryObject>();

    expect(customData).toEqual({});
  });

  it('should update user custom data successfully', async () => {
    const user = await createUserByAdmin();

    const headers = Object.freeze({
      'development-user-id': user.id,
    });

    const newCustomData = {
      foo: 'bar',
    };

    await api.patch('me/custom-data', {
      headers,
      json: {
        customData: newCustomData,
      },
    });

    const customData = await api
      .get('me/custom-data', {
        headers,
      })
      .json<ArbitraryObject>();

    expect(customData).toEqual(newCustomData);
  });

  it('should change user password successfully', async () => {
    const user = await createUserByAdmin();
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
