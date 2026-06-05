import { defaultUsernamePolicy } from '@logto/core-kit';

import {
  deleteUser,
  getUsernameCaseSensitivityConflicts,
  updateSignInExperience,
} from '#src/api/index.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { devFeatureTest, generateUsername } from '#src/utils.js';

// Dev-gated: the conflict-detection endpoint is only registered when dev features are enabled.
devFeatureTest.describe('GET /sign-in-exp/username-policy/case-sensitivity-conflicts', () => {
  it('reports usernames that collide case-insensitively', async () => {
    const base = generateUsername();
    const { totalConflicts: before } = await getUsernameCaseSensitivityConflicts(100);

    // Created under the default case-sensitive policy, so both coexist while colliding on lower().
    const lower = await createUserByAdmin({ username: base.toLowerCase() });
    const upper = await createUserByAdmin({ username: base.toUpperCase() });

    const after = await getUsernameCaseSensitivityConflicts(100);
    expect(after.totalConflicts).toBe(before + 1);
    const sample = after.samples.find(({ usernameLower }) => usernameLower === base.toLowerCase());
    expect(sample?.userIds).toEqual(expect.arrayContaining([lower.id, upper.id]));

    await deleteUser(lower.id);
    await deleteUser(upper.id);

    const { totalConflicts: restored } = await getUsernameCaseSensitivityConflicts(100);
    expect(restored).toBe(before);
  });
});

// Dev-gated: the PATCH `usernamePolicy` body field and the 409 guard only activate under dev
// features (the write path strips `usernamePolicy` otherwise).
devFeatureTest.describe('PATCH /sign-in-exp case-sensitivity conflict guard', () => {
  afterAll(async () => {
    await updateSignInExperience({ usernamePolicy: defaultUsernamePolicy });
  });

  it('rejects flipping to case-insensitive while conflicts exist with 409', async () => {
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: true },
    });
    const base = generateUsername();
    const lower = await createUserByAdmin({ username: base.toLowerCase() });
    const upper = await createUserByAdmin({ username: base.toUpperCase() });

    await expectRejects(
      updateSignInExperience({
        usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: false },
      }),
      { code: 'sign_in_experiences.username_policy_case_conflicts_exist', status: 409 }
    );

    await deleteUser(lower.id);
    await deleteUser(upper.id);
  });
});
