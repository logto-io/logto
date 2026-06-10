import { defaultUsernamePolicy } from '@logto/core-kit';
import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { deleteUser, updateSignInExperience } from '#src/api/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  registerNewUserUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import {
  defaultSignInSignUpConfigs,
  resetMfaSettings,
  resetPasswordPolicy,
} from '#src/helpers/sign-in-experience.js';
import { generateUsername, generatePassword } from '#src/utils.js';

const password = generatePassword();

// Username + password sign-up and sign-in, with the password policy relaxed so the generated
// password always passes, and MFA left non-blocking.
const enableUsernameAuth = async () => {
  await updateSignInExperience({ ...defaultSignInSignUpConfigs, passwordPolicy: {} });
  await resetMfaSettings();
};

// Restore a known baseline so this suite does not leak its sign-up/sign-in, password-policy, or
// username-policy changes into later test files.
const resetSignInExperience = async () => {
  await updateSignInExperience({
    ...defaultSignInSignUpConfigs,
    usernamePolicy: defaultUsernamePolicy,
  });
  await resetPasswordPolicy();
};

describe('experience API username case sensitivity', () => {
  beforeAll(async () => {
    await enableUsernameAuth();
  });

  afterAll(async () => {
    await resetSignInExperience();
  });

  it('registration: allows usernames that differ only by case', async () => {
    const base = generateUsername();
    const lowerId = await registerNewUserUsernamePassword(base.toLowerCase(), password);
    const upperId = await registerNewUserUsernamePassword(base.toUpperCase(), password);
    await deleteUser(lowerId);
    await deleteUser(upperId);
  });

  it('sign-in: a username that differs only by case does not match (invalid credentials)', async () => {
    const base = generateUsername();
    const user = await createUserByAdmin({ username: base.toLowerCase(), password });

    await expectRejects(
      signInWithPassword({
        identifier: { type: SignInIdentifier.Username, value: base.toUpperCase() },
        password,
      }),
      { code: 'session.invalid_credentials', status: 422 }
    );

    await deleteUser(user.id);
  });

  it('profile update: allows staging a username that differs only by case', async () => {
    const base = generateUsername();
    const other = await createUserByAdmin({ username: base.toLowerCase() });
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    await client.updateProfile({ type: SignInIdentifier.Username, value: base.toUpperCase() });

    await deleteUser(other.id);
  });
});

describe('experience API username case sensitivity (case-insensitive policy)', () => {
  beforeAll(async () => {
    await enableUsernameAuth();
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: false },
    });
  });

  afterAll(async () => {
    await resetSignInExperience();
  });

  it('registration: rejects a username that differs only by case', async () => {
    const base = generateUsername();
    const lowerId = await registerNewUserUsernamePassword(base.toLowerCase(), password);

    await expectRejects(registerNewUserUsernamePassword(base.toUpperCase(), password), {
      code: 'user.username_already_in_use',
      status: 422,
    });

    await deleteUser(lowerId);
  });

  it('sign-in: a username that differs only by case matches the existing user', async () => {
    const base = generateUsername();
    const user = await createUserByAdmin({ username: base.toLowerCase(), password });

    await signInWithPassword({
      identifier: { type: SignInIdentifier.Username, value: base.toUpperCase() },
      password,
    });

    await deleteUser(user.id);
  });

  it('profile update: rejects staging a username that differs only by case', async () => {
    const base = generateUsername();
    const other = await createUserByAdmin({ username: base.toLowerCase() });
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    await expectRejects(
      client.updateProfile({ type: SignInIdentifier.Username, value: base.toUpperCase() }),
      { code: 'user.username_already_in_use', status: 422 }
    );

    await deleteUser(other.id);
  });
});
