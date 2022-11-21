import type { CreateSignInExperience, SignInExperience } from '@logto/schemas';

import { mockColor, mockSignInExperience } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

import signInExperiencesRoutes from './sign-in-experience.js';

jest.mock('#src/queries/sign-in-experience.js', () => ({
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

jest.mock('#src/connectors.js', () => ({
  getLogtoConnectors: jest.fn(async () => []),
}));

const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

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
