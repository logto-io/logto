import { PasswordPolicyChecker, type UserInfo } from '@logto/core-kit';
import { type SignInExperience, type User } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword } from '#src/libraries/user.utils.js';

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
   * Validate password against the given password policy
   * throw a {@link RequestError} 422 if the password is invalid; otherwise, do nothing.
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
      throw new RequestError({ code: 'password.rejected', status: 422 }, { issues });
    }
  }

  public async encryptPassword(password: string) {
    return encryptUserPassword(password);
  }
}
