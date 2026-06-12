import { defaultUsernamePolicy } from '@logto/core-kit';
import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { registerNewUserUsernamePassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  defaultSignInSignUpConfigs,
  resetMfaSettings,
  resetPasswordPolicy,
} from '#src/helpers/sign-in-experience.js';
import { generateUsername, generatePassword } from '#src/utils.js';

const password = generatePassword();

// Unique (so the uniqueness check passes) but contains an uppercase letter, which the policy below
// forbids — so it trips the policy guard, not the collision check.
const uppercaseUsername = () => `A${generateUsername()}`;

const uppercaseDisabledPolicy = {
  ...defaultUsernamePolicy,
  allowedChars: { lowercase: true, uppercase: false, numbers: true, underscore: true },
};

describe('experience API username policy enforcement', () => {
  beforeAll(async () => {
    await updateSignInExperience({ ...defaultSignInSignUpConfigs, passwordPolicy: {} });
    await resetMfaSettings();
    await updateSignInExperience({ usernamePolicy: uppercaseDisabledPolicy });
  });

  afterAll(async () => {
    await updateSignInExperience({
      ...defaultSignInSignUpConfigs,
      usernamePolicy: defaultUsernamePolicy,
    });
    await resetPasswordPolicy();
  });

  it('registration rejects a username that violates the policy', async () => {
    await expectRejects(registerNewUserUsernamePassword(uppercaseUsername(), password), {
      code: 'user.username_uppercase_not_allowed',
      status: 422,
    });
  });

  it('profile update rejects a username that violates the policy', async () => {
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    await expectRejects(
      client.updateProfile({ type: SignInIdentifier.Username, value: uppercaseUsername() }),
      { code: 'user.username_uppercase_not_allowed', status: 422 }
    );
  });
});
