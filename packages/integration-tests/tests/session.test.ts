import { registerNewUser, signIn } from '@/helpers';
import { generateUsername, generatePassword } from '@/utils';

describe('username and password flow', () => {
  const username = generateUsername();
  const password = generatePassword();

  it('register with username & password', async () => {
    await expect(registerNewUser(username, password)).resolves.not.toThrow();
  });

  it('sign-in with username & password', async () => {
    await expect(signIn(username, password)).resolves.not.toThrow();
  });
});
