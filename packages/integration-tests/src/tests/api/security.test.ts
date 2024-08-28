import { createSubjectToken } from '#src/api/subject-token.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('subject-tokens', () => {
  it('should create a subject token successfully', async () => {
    const user = await createUserByAdmin();
    const response = await createSubjectToken(user.id, { test: 'test' });

    expect(response.subjectToken).toContain('sub_');
    expect(response.expiresIn).toBeGreaterThan(0);
  });

  it('should fail to create a subject token with a non-existent user', async () => {
    await expect(createSubjectToken('non-existent-user')).rejects.toThrow();
  });
});
