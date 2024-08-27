import { PasswordPolicyChecker, type UserInfo } from '@logto/core-kit';
import { UsersPasswordEncryptionMethod, type SignInExperience, type User } from '@logto/schemas';
import { argon2Verify } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword } from '#src/libraries/user.utils.js';
import assertThat from '#src/utils/assert-that.js';

import { type InteractionProfile } from '../../types.js';

function getUserInfo({
  user,
  profile,
}: {
  user?: User;
  profile?: Pick<InteractionProfile, 'name' | 'username' | 'primaryEmail' | 'primaryPhone'>;
}): UserInfo {
  return {
    name: profile?.name ?? user?.name ?? undefined,
    username: profile?.username ?? user?.username ?? undefined,
    email: profile?.primaryEmail ?? user?.primaryEmail ?? undefined,
    phoneNumber: profile?.primaryPhone ?? user?.primaryPhone ?? undefined,
  };
}

export class PasswordValidator {
  public readonly passwordPolicyChecker: PasswordPolicyChecker;

  constructor(
    private readonly passwordPolicy: SignInExperience['passwordPolicy'],
    private readonly user?: User
  ) {
    this.passwordPolicyChecker = new PasswordPolicyChecker(passwordPolicy);
  }

  /**
   * Validate password against the given password policy and current user's profile.
   *
   * @throws {RequestError} with status code 422 if the password is against the policy.
   * @throws {RequestError} with status code 422 if the password is the same as the current user's password.
   */
  public async validatePassword(password: string, profile: InteractionProfile) {
    const userInfo = getUserInfo({
      user: this.user,
      profile,
    });

    const issues = await this.passwordPolicyChecker.check(
      password,
      this.passwordPolicyChecker.policy.rejects.userInfo ? userInfo : {}
    );

    if (issues.length > 0) {
      throw new RequestError({ code: 'password.rejected', status: 422 }, issues);
    }

    if (this.user) {
      const { passwordEncrypted: oldPasswordEncrypted, passwordEncryptionMethod } = this.user;

      assertThat(
        !oldPasswordEncrypted ||
          // If the password is not encrypted with Argon2i, allow to reset the same password with Argon2i
          passwordEncryptionMethod !== UsersPasswordEncryptionMethod.Argon2i ||
          !(await argon2Verify({ password, hash: oldPasswordEncrypted })),
        new RequestError({ code: 'user.same_password', status: 422 })
      );
    }
  }

  public async createPasswordDigest(password: string) {
    return encryptUserPassword(password);
  }
}
