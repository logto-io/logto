import type { CreateSignInExperience, SignInExperience } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockColor, mockSignInExperience } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { mockEsm } = createMockUtils(import.meta.jest);

const signInExperiencesRoutes = await pickDefault(import('./index.js'));
const signInExperienceRequester = createRequester({
  authedRoutes: signInExperiencesRoutes,
  tenantContext: new MockTenant(undefined, {
    signInExperiences: {
      updateDefaultSignInExperience: async (
        data: Partial<CreateSignInExperience>
      ): Promise<SignInExperience> => ({
        ...mockSignInExperience,
        ...data,
      }),
    },
  }),
});

const expectPatchResponseStatus = async (
  signInExperience: Record<string, unknown>,
  status: number
) => {
  const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
  expect(response.status).toEqual(status);
};

const colorKeys = ['primaryColor', 'darkPrimaryColor'];
const invalidColors = [null, '#0'];

describe('colors', () => {
  test.each(invalidColors)('should fail when color is %p', async (invalidColor) => {
    for (const colorKey of colorKeys) {
      // eslint-disable-next-line no-await-in-loop
      await expectPatchResponseStatus({ color: { ...mockColor, [colorKey]: invalidColor } }, 400);
    }
  });
  it('should succeed when color is valid', async () => {
    for (const colorKey of colorKeys) {
      // eslint-disable-next-line no-await-in-loop
      await expectPatchResponseStatus({ color: { ...mockColor, [colorKey]: '#169deF' } }, 200);
    }
  });
});
