import { type SignInOptions } from '@logto/node';
import { demoAppApplicationId } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { type ExperienceClient } from '#src/client/experience/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { parseInteractionCookie } from '#src/utils.js';

/**
 * Start an authorization on the client's current cookie jar (so an existing OIDC session is
 * presented) and merge the cookies it sets, so the client can continue with the interaction the
 * authorization started.
 */
export const authorizeWithSession = async (
  client: ExperienceClient,
  options: Omit<SignInOptions, 'redirectUri'> = {}
) => {
  const response = await client.startAuthorization(
    demoAppRedirectUri,
    options,
    client.getCookieHeader('/oidc/auth')
  );
  const setCookies = response.headers.getSetCookie();
  client.mergeRawCookies(setCookies);

  return { status: response.status, location: response.headers.get('location') ?? '', setCookies };
};

/** The id of the interaction the authorization response just started. */
export const getInteractionId = (setCookies: string[]) => {
  const interactionCookie = setCookies
    .map((cookie) => cookie.split(';')[0]?.trim() ?? '')
    .find((cookie) => cookie.startsWith('_interaction='));
  assert(interactionCookie, new Error('No interaction cookie was set'));
  const interactionId = parseInteractionCookie(interactionCookie.slice('_interaction='.length))[
    demoAppApplicationId
  ];
  assert(interactionId, new Error('No interaction id for the demo app'));

  return interactionId;
};

/** Expect the authorization response to have redirected to the client with the given OIDC error. */
export const expectRedirectedError = (location: string, error: string) => {
  expect(location.startsWith(demoAppRedirectUri)).toBe(true);
  expect(new URL(location).searchParams.get('error')).toBe(error);
  expect(new URL(location).searchParams.has('code')).toBe(false);
};
