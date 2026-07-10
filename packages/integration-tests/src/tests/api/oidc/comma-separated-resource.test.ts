import { demoAppApplicationId } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import ky from 'ky';

import { createResource, deleteResource } from '#src/api/resource.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';

const codeChallenge = 'a'.repeat(43);

const requestAuthorization = async (resources: string[], commaSeparated: boolean) => {
  const resourceParameters = commaSeparated
    ? [['resource', resources.join(',')]]
    : resources.map((resource) => ['resource', resource]);
  const searchParameters = new URLSearchParams([
    ['client_id', demoAppApplicationId],
    ['code_challenge', codeChallenge],
    ['code_challenge_method', 'S256'],
    ['redirect_uri', demoAppRedirectUri],
    ['response_type', 'code'],
    ['scope', 'openid'],
    ...resourceParameters,
  ]);
  const url = new URL(`/oidc/auth?${searchParameters.toString()}`, logtoUrl);

  const response = await ky.get(url, { redirect: 'manual', throwHttpErrors: false });
  const location = response.headers.get('location');
  assert(location, new Error('Missing authorization response location'));

  return {
    location: new URL(location, logtoUrl).pathname,
    status: response.status,
  };
};

describe('comma-separated resource parameter', () => {
  it('behaves like separate resource parameters on the authorization endpoint', async () => {
    const resources = await Promise.all([createResource(), createResource()]);

    try {
      const [separateResult, commaSeparatedResult] = await Promise.all([
        requestAuthorization(
          resources.map(({ indicator }) => indicator),
          false
        ),
        requestAuthorization(
          resources.map(({ indicator }) => indicator),
          true
        ),
      ]);

      expect(separateResult).toEqual({ location: '/sign-in', status: 303 });
      expect(commaSeparatedResult).toEqual(separateResult);
    } finally {
      await Promise.all(resources.map(async ({ id }) => deleteResource(id)));
    }
  });
});
