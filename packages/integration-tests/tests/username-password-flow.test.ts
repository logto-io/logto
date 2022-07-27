import { registerUserAndSignIn } from '@/helpers';

describe('username and password flow', () => {
  it('should register and sign in with username and password successfully', async () => {
    expect(async () => {
      await registerUserAndSignIn();
    }).not.toThrow();
  });
});
