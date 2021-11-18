import { Users } from '@logto/schemas';

import { createTestTable } from '@/utils/test-utils';

import {
  findUserByUsername,
  findUserById,
  hasUser,
  hasUserWithId,
  insertUser,
  findAllUsers,
  updateUserById,
  deleteUserById,
} from './user';

const USER_ID = 'test_id';
const USER_NAME = 'test_name';

describe('user queries', () => {
  beforeAll(async () => {
    // Create temp table for users
    await createTestTable(Users);
  });

  it('hasUser_should_return_true_after_insertUser', async () => {
    await insertUser({
      id: USER_ID,
      username: USER_NAME,
    });

    const has = await hasUser(USER_NAME);
    expect(has).toBe(true);
  });

  it('findUserByUsername_should_return', async () => {
    const user = await findUserByUsername(USER_NAME);
    expect(user.id).toBe(USER_ID);
  });

  it('findUserById_should_return', async () => {
    const user = await findUserById(USER_ID);
    expect(user.username).toBe(USER_NAME);
  });

  it('hasUserWithId_should_return_true', async () => {
    const hasDummyUser = await hasUserWithId('dummy_user');
    expect(hasDummyUser).toBe(false);

    const hasTestUser = await hasUserWithId(USER_ID);
    expect(hasTestUser).toBe(true);
  });

  it('findAllUsers_should_return_all_users', async () => {
    const users = await findAllUsers();
    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe(USER_ID);
  });

  it('findUserById_should_return_email_after_updateUserById', async () => {
    const EMAIL = 'test@logto.io';
    const user = await findUserById(USER_ID);
    expect(user.primaryEmail).toBeFalsy();

    await updateUserById(USER_ID, { primaryEmail: EMAIL });
    const updatedUser = await findUserById(USER_ID);
    expect(updatedUser.primaryEmail).toBe(EMAIL);
  });

  it('hasUser_should_return_falsy_after_deleteUserById', async () => {
    await deleteUserById(USER_ID);
    const has = await hasUser(USER_NAME);
    expect(has).toBe(false);
  });
});
