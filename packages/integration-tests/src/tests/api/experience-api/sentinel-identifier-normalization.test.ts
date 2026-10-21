import {
  SentinelActivityTargetType,
  SignInIdentifier,
  type SignInExperience,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import { authedAdminApi } from '#src/api/api.js';
import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

const invalidCredentials = { code: 'session.invalid_credentials', status: 422 };
const lockedOut = { code: 'session.verification_blocked_too_many_attempts', status: 400 };

/** A third spelling: the generated local part is a lower-cased UUID, so only the domain differs. */
const upperCaseDomain = (email: string) => {
  const [local = '', domain = ''] = email.split('@');

  return `${local}@${domain.toUpperCase()}`;
};

/** `1310XXXXXXX` spaced as a human would type it. */
const spacedPhone = (phone: string) => `+${phone.slice(0, 1)} ${phone.slice(1)}`;

/** `1310XXXXXXX` punctuated as a human would type it. */
const punctuatedPhone = (phone: string) =>
  `+${phone.slice(0, 1)} (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7)}`;

const attemptWrongPassword = async (type: SignInIdentifier, value: string) => {
  const client = await initExperienceClient();

  return client.verifyPassword({ identifier: { type, value }, password: 'not-the-password' });
};

describe('sentinel lockout identifier normalization', () => {
  const userApi = new UserApiTest();
  // eslint-disable-next-line @silverhand/fp/no-let
  let originalSentinelPolicy: Optional<SignInExperience['sentinelPolicy']>;

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();

    const signInExperience = await getSignInExperience();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    originalSentinelPolicy = signInExperience.sentinelPolicy;

    // Two recorded failures are allowed; the third attempt is blocked.
    await updateSignInExperience({ sentinelPolicy: { maxAttempts: 3, lockoutDuration: 10 } });
  });

  afterAll(async () => {
    await userApi.cleanUp();
    await updateSignInExperience({ sentinelPolicy: originalSentinelPolicy ?? {} });
  });

  it('counts email casing variants against a single lockout bucket', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    await userApi.create({ primaryEmail, password });

    // Every spelling authenticates against the same account, so every spelling must share a bucket.
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Email, primaryEmail),
      invalidCredentials
    );
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Email, primaryEmail.toUpperCase()),
      invalidCredentials
    );
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Email, upperCaseDomain(primaryEmail)),
      lockedOut
    );

    // The lockout covers the canonical spelling too, not only the one that tripped it.
    await expectRejects(attemptWrongPassword(SignInIdentifier.Email, primaryEmail), lockedOut);
  });

  it('counts equivalent phone formats against a single lockout bucket', async () => {
    const { primaryPhone, password } = generateNewUserProfile({
      primaryPhone: true,
      password: true,
    });
    await userApi.create({ primaryPhone, password });

    // The guard keys on `internationalNumber` while `findUserByNormalizedPhone` matches on both the
    // international and leading-zero forms — this pins the two together end-to-end.
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Phone, primaryPhone),
      invalidCredentials
    );
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Phone, spacedPhone(primaryPhone)),
      invalidCredentials
    );
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Phone, punctuatedPhone(primaryPhone)),
      lockedOut
    );
  });

  it('keeps username case variants in separate buckets under a case-sensitive policy', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });

    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Username, username),
      invalidCredentials
    );
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Username, username),
      invalidCredentials
    );
    await expectRejects(attemptWrongPassword(SignInIdentifier.Username, username), lockedOut);

    // Usernames are case-sensitive by default, so the upper-cased spelling is a different account
    // and must not inherit the lockout — otherwise an attacker could lock out a lookalike.
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Username, username.toUpperCase()),
      invalidCredentials
    );
  });

  it('unblocks a locked-out identifier regardless of the spelling the admin submits', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    await userApi.create({ primaryEmail, password });

    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Email, primaryEmail),
      invalidCredentials
    );
    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Email, primaryEmail),
      invalidCredentials
    );
    await expectRejects(attemptWrongPassword(SignInIdentifier.Email, primaryEmail), lockedOut);

    // The console unblock form takes whatever the admin types, which need not be the spelling the
    // bucket was keyed under.
    await authedAdminApi.post('sentinel-activities/delete', {
      json: {
        targetType: SentinelActivityTargetType.User,
        targets: [primaryEmail.toUpperCase()],
      },
    });

    await expectRejects(
      attemptWrongPassword(SignInIdentifier.Email, primaryEmail),
      invalidCredentials
    );
  });
});
