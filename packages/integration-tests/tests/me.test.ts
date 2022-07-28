import { userInfoSelectFields } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import {
  getCurrentUserInfo,
  getCurrentUserCustomData,
  updateCurrentUserCustomDate,
  changeCurrentUserPassword,
} from '@/api';
import { createUserByAdmin, signIn } from '@/helpers';
import { generatePassword } from '@/utils';

describe('api `/me`', () => {
  it('should get user info successfully', async () => {
    const user = await createUserByAdmin();

    const userInfo = await getCurrentUserInfo(user.id);

    expect(userInfo.id).toBe(user.id);

    for (const field of userInfoSelectFields) {
      expect(userInfo).toHaveProperty(field);
    }
  });

  it('should get user custom data successfully', async () => {
    const user = await createUserByAdmin();
    const customData = await getCurrentUserCustomData(user.id);
    expect(customData).toEqual({});
  });

  it('should update user custom data successfully', async () => {
    const user = await createUserByAdmin();

    const foo = 'bar';

    await updateCurrentUserCustomDate(user.id, { foo });

    const customData = await getCurrentUserCustomData(user.id);

    expect(customData).toEqual({ foo });
  });

  it('should change user password successfully', async () => {
    const user = await createUserByAdmin();
    const password = generatePassword();

    await changeCurrentUserPassword(user.id, password);

    assert(user.username, new Error('empty username'));

    void expect(signIn(user.username, password)).resolves.not.toThrow();
  });
});
